import logger from '../logger'

/**
 * Will format a parsed latex object, back to a latex string.
 * @param {object} parsedLatex An object parsed by "parser.js"
 * @return {string} A plain latex string
 */
const formatter = (parsedLatex) => {
  logger.debug('Formating parsed latex, back to a string')
  let formattedString = ''

  for (var i = 0; i < parsedLatex.length; i++) {
    const item = parsedLatex[i]
    logger.debug('Handling item: ' + item.type)

    if (item.type === 'token') {
      // Prepend backslash to token
      formattedString += '\\' + item.value
    } else if (item.type === 'group') {
      formattedString += '{' + formatter(item.value) + '}'
    } else if (item.type === 'variable' && i > 0) {
      formattedString += ' ' + item.value
    } else {
      formattedString += item.value
    }
  }

  logger.debug('Formatted latex: ' + formattedString)
  return formattedString
}

export default formatter

