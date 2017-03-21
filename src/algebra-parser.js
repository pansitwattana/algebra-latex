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
  let exp = new Expression(0)
  let expFirst = null
  let nextOperator = null

  // First iteration of current expression
  let firstIteration = true

  for (var i = 0; i < parsedLatex.length; i++) {
    const type = parsedLatex[i].type
    const value = parsedLatex[i].value

    logger.debug('parsing: ' + type + ', ' + value)

    if (firstIteration) nextOperator = '+'

    switch (type) {
      case 'variable':
      case 'number':
        exp = parseNumber(exp, value, nextOperator)
        break
      case 'token':
        const parsedObj = parseToken(exp, nextOperator, value, parsedLatex.slice(i), i)
        exp = parsedObj.exp
        if (parsedObj.i) i = parsedObj.i
        break
      case 'operator':
        nextOperator = parseNextOperator(value)
        // Check for equalsign, if found reconstructure to equation from expression
        if (value === '=') {
          if (expFirst != null) {
            return new Error('Too many equal signs')
          }
          logger.debug('- Found equal sign, creating next expression')
          expFirst = exp
          exp = new Expression(0)
          firstIteration = true
          continue
        }
        break
    }

    if (type !== 'operator') nextOperator = null
    firstIteration = false
  }

  if (expFirst != null) {
    return new Equation(expFirst, exp)
  }

  return exp
}

/**
 * Parse a frac token
 * @param  {Object} firstGroup  The upper part of the fraction, in parsed latex
 * @param  {Object} secondGroup The lower part of the fraction, in parsed latex
 * @return {Fraction}               A fraction object
 */
const parseFrac = (firstGroup, secondGroup) => {
  logger.debug('- Parsing frac')
  let first = algebraParser(firstGroup)
  let second = algebraParser(secondGroup)

  first = functors.numerify(first.toString())
  second = functors.numerify(second.toString())

  // Make sure they are not equations
  if (first instanceof Equation || second instanceof Equation) {
    return new Error('Fraction part can not be an equation')
  }

  logger.debug('First expr: ' + first + ', Second expr: ' + second)

  logger.debug('- - Returning new expression for expressions ' + first.toString() + ' AND ' + second.toString())
  const fracExpr = new Fraction(first, second)
  return fracExpr
}

/**
 * parse "type=number|variable"
 * @param  {Expression} exp            Current expression
 * @param  {String} value          The current value from parsed latex
 * @param  {String} nextOperator   The currently next operator
 * @return {Expression}                  The new expression
 */
const parseNumber = (exp, value, nextOperator) => {
  if (nextOperator == null) {
    logger.debug('- Next operator not set, setting it to *')
    nextOperator = '*'
  }

  exp = operatorCombine(exp, functors.numerify(value), nextOperator)

  return exp
}

/**
 * Combine an expression with a value using the nextOperator
 * @param  {Expression} exp          The base expression to build upon
 * @param  {(Expression|Fraction|Number|String)} newValue The new value to add to the base
 * @param  {String} nextOperator The operator used to combine the values,
 *                               can be one of the following +-/*
 * @return {Expression}          The new combined expression
 */
const operatorCombine = (exp, newValue, nextOperator) => {
  logger.debug('Combining values: ' + nextOperator)
  switch (nextOperator) {
    case '+':
      logger.debug('- - Adding value: ' + newValue.toString() + ' to expression: ' + exp)
      exp = exp.add(newValue)
      break
    case '-':
      logger.debug('- - Subtracting value: ' + newValue.toString())
      exp = exp.subtract(newValue)
      break
    case '*':
      logger.debug('- - Multiplying value: ' + newValue.toString())
      exp = exp.multiply(newValue)
      break
    case '/':
      logger.debug('- - Dividing value: ' + newValue.toString())
      exp = exp.divide(newValue)
      break
  }

  return exp
}

/**
 * Find the next operator, should be called on 'type = operator'
 * @param  {String} value current latex value
 * @return {String}         The value for the next operator
 */
const parseNextOperator = (value) => {
  if (value.match(/[+\-*/]/)) {
    logger.debug('- setting next operator: ' + value)
    return value
  }
  return null
}

/**
 * Parse "type=token"
 * @param  {Expression} exp          The current expression
 * @param  {String} nextOperator The next operator
 * @param  {String} value        The value of the current parsed latex object
 * @param  {Array} parsedLatex  An array of the parsed latex,
 *                              with the first item being the currently parsing object
 * @param  {Number} i           The iteration number
 * @return {Object} The parsed expression (Fraction|Expression|Error), based on the "exp" parameter,
 *                      And the value i
 */
const parseToken = (exp, nextOperator, value, parsedLatex, i) => {
  logger.debug('- - Start is token')
  if (value === 'frac') {
    logger.debug('- - - Token is frac')
    if (parsedLatex[1].type !== 'group' || parsedLatex[2].type !== 'group') {
      return new Error('Fraction must be followed by 2 groups')
    }
    const frac = parseFrac(parsedLatex[1].value, parsedLatex[2].value)
    if (frac instanceof Error) return frac
    i += 2
    logger.debug('Fraction value: ' + frac)
    logger.debug('- - - Combining expression and fraction')
    return {
      exp: operatorCombine(exp, frac, nextOperator),
      i
    }
  } else {
    // TODO add more tokens, for start of parsed object
    return new Error('Can not handle token in the beginning of object: ' + value)
  }
}

/*
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
*/

// Functors
const functors = {
  numerify: (val) => {
    logger.debug('- Numerify: ' + val)
    if (isNaN(val)) { return val }
    return parseInt(val)
  }
}

export default algebraParser
