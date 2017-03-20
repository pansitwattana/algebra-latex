import { Expression, Equation, Fraction } from 'algebra.js'
import logger from './logger'

/**
 * Parses a parsed latex object to algebra.js
 * @param  {object} parsedLatex An object parsed by "./parser.js"
 * @return {Expression|Equation}               Either an algebra.js expression or equation
 */
const algebraParser = (parsedLatex) => {
  let exp = new Expression('0')
  let expFirst = null
  let nextOperator = null

  // Functors
  const numerify = (val) => {
    logger.debug('- Numerify: ' + val)
    if (isNaN(val)) { return val }
    return parseInt(val)
  }

  for (var i = 0; i < parsedLatex.length; i++) {
    const type = parsedLatex[i].type
    const value = parsedLatex[i].value

    logger.debug('parsing: ' + type + ', ' + value)
    if (type === 'operator') {
      if (value.match(/[+\-*/]/)) {
        logger.debug('- setting next operator: ' + value)
        nextOperator = value
      }

      if (value === '=') {
        if (expFirst != null) {
          return new Error('Too many equal signs')
        }
        logger.debug('- Found equal sign, creating next expression')
        expFirst = exp
        exp = new Expression('0')
      }
    }

    if (type === 'variable' || type === 'number') {
      if (i === 0) {
        logger.debug('- Adding initial value to expression ' + value)
        exp = exp.add(numerify(value))
      } else {
        if (nextOperator == null) {
          logger.debug('- Next operator not set, setting it to *')
          nextOperator = '*'
        }

        logger.debug('- Handling operation ' + nextOperator + ' ' + value)
        switch (nextOperator) {
          case '+':
            logger.debug('- - Adding value: ' + value)
            exp = exp.add(numerify(value))
            break
          case '-':
            logger.debug('- - Subtracting value: ' + value)
            exp = exp.subtract(numerify(value))
            break
          case '*':
            logger.debug('- - Multiplying value: ' + value)
            exp = exp.multiply(numerify(value))
            break
          case '/':
            logger.debug('- - Dividing value: ' + value)
            exp = exp.divide(numerify(value))
            break
        }
      }
    }
  }

  if (expFirst != null) {
    return new Equation(expFirst, exp)
  }

  return exp
}

export default algebraParser
