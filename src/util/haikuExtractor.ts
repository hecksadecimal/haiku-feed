import { syllable } from 'syllable'

// Strips the input of any hashtags, mentions, and URLs, trailing or leading whitespace, non alpha-numerics, retaining punctuation and returns the sanitized string.
// Numbers must be separated by spaces to be counted as syllables.
function sanitize(input: string) {
    // Remove hashtags
    input = input.replace(/#[^\s]+/g, '')

    // Remove mentions
    input = input.replace(/@[^\s]+/g, '')

    // Remove URLs
    input = input.replace(/https?:\/\/[^\s]+/g, '')

    // Remove trailing and leading whitespace
    input = input.trim()

    // Replace numbers with spaces
    input = input.replace(/[0-9]/g, ' ')

    return input
}

// This function takes a string and builds three arrays of words
// The first array must have words that add up to 5 syllables
// The second array must have words that add up to 7 syllables
// The third array must have words that add up to 5 syllables
// Returns null if the input does not form a haiku
// Returns the haiku as a string with newlines if it does
export function extractHaiku(input: string, debug=false) {
    input = sanitize(input)

    const words = input.split(' ')
    const haiku = ['', '', '']
    const syllables = [0, 0, 0]

    for (let i = 0; i < words.length; i++) {
        const word = words[i]
        const syl = syllable(word)

        if (syllables[0] + syl <= 5) {
            syllables[0] += syl
            haiku[0] += word + ' '
        } else if (syllables[1] + syl <= 7) {
            syllables[1] += syl
            haiku[1] += word + ' '
        } else if (syllables[2] + syl <= 5) {
            syllables[2] += syl
            haiku[2] += word + ' '
        } else {
            return null
        }
    }

    haiku[0] = haiku[0].trim()
    haiku[1] = haiku[1].trim()
    haiku[2] = haiku[2].trim()

    if (syllables[0] === 5 && syllables[1] === 7 && syllables[2] === 5) {
        if (debug) {
            console.log(haiku)
        }
        return haiku.join('\n')
    } else {
        return null
    }
}
