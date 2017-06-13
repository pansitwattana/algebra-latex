import formatter from '../src/formatters/format-latex.js'
import assert from 'assert'

describe('formatter - latex', () => {
  it('should format a general latex example back to latex', () => {
    const parsedLatex = [
      {
        type: 'token',
        value: 'frac'
      },
      {
        type: 'group',
        value: [
          {
            type: 'number',
            value: '2'
          },
          {
            type: 'operator',
            value: '^'
          },
          {
            type: 'group',
            value: [
              {
                type: 'number',
                value: '3'
              }
            ]
          },
          {
            type: 'operator',
            value: '+'
          },
          {
            type: 'number',
            value: '3'
          }
        ]
      },
      {
        type: 'group',
        value: [
          {
            type: 'operator',
            value: '+'
          },
          {
            type: 'number',
            value: '3'
          }
        ]
      }
    ]

    assert.equal(formatter(parsedLatex), '\\frac{2^{3}+3}{+3}')
  })
})

