/**
 * For parsing latex to algebra.js manually, for more flexibility
 */

import { Expression, Equation, Fraction } from 'algebra.js'
import logger from './logger'

/**
 * Parses a parsed latex object to algebra.js
 * @param  {object} parsedLatex An object parsed by "./parser.js"
 * @return {Expression|Equation}               Either an algebra.js expression or equation
 */
const algebraParser = (parsedLatex) => {
  let exp = null
  let expFirst = null
  let nextOperator = null

  for (var i = 0; i < parsedLatex.length; i++) {
    const type = parsedLatex[i].type
    const value = parsedLatex[i].value

    logger.debug('parsing: ' + type + ', ' + value)

    if (i === 0) {
      logger.debug('- Adding initial value to expression ' + value)
      exp = parseStart(parsedLatex)

      if (exp instanceof Error) { return exp }
      continue
    }

    if (type === 'variable' || type === 'number') {
      if (nextOperator == null) {
        logger.debug('- Next operator not set, setting it to *')
        nextOperator = '*'
      }

      logger.debug('- Handling operation ' + nextOperator + ' ' + value)
      switch (nextOperator) {
        case '+':
          logger.debug('- - Adding value: ' + value)
          exp = exp.add(functors.numerify(value))
          break
        case '-':
          logger.debug('- - Subtracting value: ' + value)
          exp = exp.subtract(functors.numerify(value))
          break
        case '*':
          logger.debug('- - Multiplying value: ' + value)
          exp = exp.multiply(functors.numerify(value))
          break
        case '/':
          logger.debug('- - Dividing value: ' + value)
          exp = exp.divide(functors.numerify(value))
          break
      }
    }

    if (type === 'operator') {
      if (value.match(/[+\-*/]/)) {
        logger.debug('- setting next operator: ' + value)
        nextOperator = value
        continue
      }

      if (value === '=') {
        if (expFirst != null) {
          return new Error('Too many equal signs')
        }
        logger.debug('- Found equal sign, creating next expression')
        expFirst = exp
        exp = parseStart(parsedLatex.slice(i + 1))
        i++
        continue
      }
    } else {
      nextOperator = null
    }
  }

  if (expFirst != null) {
    return new Equation(expFirst, exp)
  }

  return exp
}

/**
 * Parse a frac token
 * @param  {object} firstGroup  The upper part of the fraction, in parsed latex
 * @param  {object} secondGroup The lower part of the fraction, in parsed latex
 * @return {Fraction}               A fraction object
 */
const parseFrac = (firstGroup, secondGroup) => {
  logger.debug('- Parsing frac')
  const firstExpression = algebraParser(firstGroup)
  const secondExpression = algebraParser(secondGroup)

  // Make sure they are expressions and not equations
  if (firstExpression instanceof Expression && secondExpression instanceof Expression) {
    // return new Fraction(firstGroup, secondGroup)
    logger.debug('- - Returning new expression for expressions ' + firstExpression.toString() + ' AND ' + secondExpression.toString())
    const fracExpr = firstExpression.divide(parseInt(secondExpression.toString()))
    return fracExpr
  } else {
    return new Error('Fraction part can not be an equation')
  }
}

const parseStart = (parsedLatex) => {
  const type = parsedLatex[0].type
  const value = parsedLatex[0].value

  logger.debug('- Parsing start of latex: ' + type + ', ' + value)
  let exp = null
  switch (type) {
    case 'variable':
    case 'number':
      logger.debug('- - Start is variable or number')
      exp = new Expression(functors.numerify(value))
      break
    case 'token':
      logger.debug('- - Start is token')
      if (value === 'frac') {
        logger.debug('- - - Token is frac')
        if (parsedLatex[1].type !== 'group' || parsedLatex[2].type !== 'group') {
          return new Error('Fraction must be followed by 2 groups')
        }
        exp = new Expression(parseFrac(parsedLatex[1].value, parsedLatex[2].value))
        if (exp instanceof Error) { return exp }
      } else {
        // TODO add more tokens, for start of parsed object
        return new Error('Can not handle token in the beginning of object: ' + value)
      }
      break
    case 'group':
      logger.debug('- - Start is group, parsing that')
      exp = algebraParser(value)
      break
    case 'operator':
      logger.debug('- - Start is operator')
      const isReal = parsedLatex[1].type === 'variable' || parsedLatex[1].type === 'number'
      const error = new Error('Begining must be followed by a number or a variable')
      switch (value) {
        case '*':
        case '+':
          logger.debug('- - - Operator is * or +')
          if (isReal) {
            exp = parseStart(parsedLatex.slice(1))
          } else { return error }
          break
        case '-':
          logger.debug('- - - Operator is -')
          if (isReal) {
            exp = new Expression('0').subtract(parseStart(parsedLatex.slice(1)))
          } else { return error }
          break
        case '/':
          logger.debug('- - - Operator is /')
          if (isReal) {
            exp = new Expression('1').divide(parseStart(parsedLatex.slice(1)))
          } else { return error }
          break
      }
  }

  return exp
}

// Functors
const functors = {
  numerify: (val) => {
    logger.debug('- Numerify: ' + val)
    if (isNaN(val)) { return val }
    return parseInt(val)
  }
}

export default algebraParser
