import { Expression, Equation, Fraction } from 'algebra.js'
import parser from '../src/algebra-parser'
import assert from 'assert'

describe('algebra parser', () => {
  it('should work', () => {
    const parsedLatex1 = [
      {
        type: 'number',
        value: '2'
      }, {
        type: 'operator',
        value: '+'
      }, {
        type: 'variable',
        value: 'x'
      }, {
        type: 'operator',
        value: '='
      }, {
        type: 'number',
        value: '3'
      }
    ]

    let exp = new Expression(2).add('x')
    let exprected = new Equation(exp, new Expression(3))

    console.log('- The expression: ' + parser(parsedLatex1).toString())
    console.log('- Expected expression: ' + exprected.toString())
    assert.equal(parser(parsedLatex1), exprected)
  })
})
