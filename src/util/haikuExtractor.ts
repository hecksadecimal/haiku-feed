import nlp from 'compromise'
import speechPlugin from 'compromise-speech'
import * as name from 'emoji-unicode-map'
nlp.plugin(speechPlugin)

// Strips the input of any hashtags, mentions, and URLs, trailing or leading whitespace
// Numbers must be separated by spaces to be counted as syllables.
// All unicode emojis are first converted to their names
function sanitize(input: string) {
    // Remove hashtags
    input = input.replace(/#[^\s]+/g, '')
    // Remove mentions
    input = input.replace(/@[^\s]+/g, '')
    // Remove URLs
    input = input.replace(/(https?:\/\/[^\s]+)/g, '')
    // Detect all unicode emojis and convert them to their names, underscores replaced with spaces
    // Ensure a space is added before and after the emoji name
    // Replace underscore with space
    // This is done to properly count syllables in emojis
    input = input.replace(/(?:[\u00A9\u00AE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9-\u21AA\u231A-\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA-\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614-\u2615\u2618\u261D\u2620\u2622-\u2623\u2626\u262A\u262E-\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u2660\u2663\u2665-\u2666\u2668\u267B\u267F\u2692-\u2697\u2699\u269B-\u269C\u26A0-\u26A1\u26AA-\u26AB\u26B0-\u26B1\u26BD-\u26BE\u26C4-\u26C5\u26C8\u26CE-\u26CF\u26D1\u26D3-\u26D4\u26E9-\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733-\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763-\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934-\u2935\u2B05-\u2B07\u2B1B-\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|(?:\uD83C[\uDC04\uDCCF\uDD70-\uDD71\uDD7E-\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01-\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50-\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96-\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F-\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95-\uDD96\uDDA4-\uDDA5\uDDA8\uDDB1-\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB-\uDEEC\uDEF0\uDEF3-\uDEF6]|\uD83E[\uDD10-\uDD1E\uDD20-\uDD27\uDD30\uDD33-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD4B\uDD50-\uDD5E\uDD80-\uDD91\uDDC0]))/g, (match) => {
        return ' ' + name.get(match) + ' '
    })
    // Remove leading and trailing whitespace
    input = input.trim()

    return input
}

// This function takes a string and builds three arrays of words
// The first array must have words that add up to 5 syllables
// The second array must have words that add up to 7 syllables
// The third array must have words that add up to 5 syllables
// Returns null if the input does not form a haiku
// Returns the haiku as a string with newlines if it does
export function extractHaiku(input: string, debug=false) {
    // Sanitize the input
    input = sanitize(input)

    // Splits input into words, and words into syllables
    // @ts-expect-error
    var words: String[][] = nlp(input).terms().syllables()

    // Count total syllables
    var totalSyllables = words.flat().length

    // If total syllables is not 17, return null
    if (totalSyllables !== 17) {
        return null
    }

    // Initialize arrays for each line of the haiku
    var line1: String[] = []
    var line2: String[] = []
    var line3: String[] = []

    // Initialize syllable counters for each line
    var count1 = 0
    var count2 = 0
    var count3 = 0

    // Iterate through each word in the input, building the haiku
    // Each word is an array of syllables
    // If a line goes over the syllable count, return null
    // If a line is exactly the syllable count, add it to the line
    // If a line is under the syllable count, add it to the line 
    // and continue to the next word
    for (const word of words) {
        if (count1 < 5) {
            if (count1 + word.length > 5) {
                return null
            }
            count1 += word.length
            line1.push(word.join(''))
        } else if (count2 < 7) {
            if (count2 + word.length > 7) {
                return null
            }
            count2 += word.length
            line2.push(word.join(''))
        } else if (count3 < 5) {
            if (count3 + word.length > 5) {
                return null
            }
            count3 += word.length
            line3.push(word.join(''))
        } else {
            return null
        }
    }

    // If the haiku is not exactly 17 syllables, return null
    if (count1 !== 5 || count2 !== 7 || count3 !== 5) {
        return null
    }

    // Join the lines into a haiku
    var haiku = line1.join(' ') + '\n' + line2.join(' ') + '\n' + line3.join(' ')

    // Debug print
    if (debug) {
        console.log(haiku)
    }

    return haiku
}
