import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'
import { extractor } from './algos/haiku'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return

    const ops = await getOpsByType(evt)

    // Also add to postsToDelete posts in our database that are over 48 hours old
    const postsToKeep = await this.db
      .selectFrom('post')
      .selectAll()
      .execute()
    const postsToDeleteOld = postsToKeep
      .filter((post) => {
        const indexedAt = new Date(post.indexedAt)
        const now = new Date()
        const diff = now.getTime() - indexedAt.getTime()
        return diff > 48 * 60 * 60 * 1000
      })
      .map((post) => post.uri)

      // merge postsToDelete and postsToDeleteOld
      const postsToDelete = ops.posts.deletes.map((del) => del.uri).concat(postsToDeleteOld)


    // If extractor(create.record.text) returns null do not add the post to the database, otherwise use its output for postText
    const postsToCreate = ops.posts.creates
      .map((create) => {
        return {
          uri: create.uri,
          cid: create.cid,
          indexedAt: new Date().toISOString(),
          postText: create.record.text.toLowerCase(),
          haiku: extractor(create.record.text),
        }
      })
      .filter((post) => post.haiku !== null)
      .map((post) => {
        return {
          ...post,
          syllables: 17,
          haiku: post.haiku!,
        }
      }
    )

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    if (postsToCreate.length > 0) {
      // debug print
      console.log(postsToCreate)
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
