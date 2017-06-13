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

  describe('greek letters', () => {
    it('should format lower case', () => {
      const parsedLatex = [
        {
          type: 'token',
          value: 'alpha'
        }, {
          type: 'token',
          value: 'delta'
        }, {
          type: 'token',
          value: 'gamma'
        }
      ]

      assert.equal(formatter(parsedLatex), '\\alpha\\delta\\gamma')
    })
  })

  describe('multiple variables', () => {
    it('should properly space variables', () => {
      const parsedLatex = [
        {
          type: 'variable',
          value: 'speed'
        }, {
          type: 'variable',
          value: 'velocity'
        }
      ]

      assert.equal(formatter(parsedLatex), 'speed velocity')
    })
  })
})

