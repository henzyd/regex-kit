import { g, spec, w } from './types.js';

export const colour = [
  spec(
    'isHexColor',
    g(
      ['#fff', '#ffffff', '#FFF', '#1a2B3c'],
      ['fff', '#ff', '#ffff', '#fffffff', '#ffffff80', '#ggg', 'red', '# fff']
    ),
    w([{ allowAlpha: true }], ['#ffffff80', '#fff8', '#fff', '#ffffff'], ['#fffff', '#ffffff8']),
    w([{ allowShort: false }], ['#ffffff'], ['#fff']),
    w([{ allowShort: false, allowAlpha: true }], ['#ffffff80'], ['#fff8']),
    w([{ requireHash: false }], ['fff', 'ffffff', '#fff'], ['ff'])
  ),
  spec(
    'isRgbColor',
    g(
      [
        'rgb(255, 0, 0)',
        'rgb(255,0,0)',
        'rgba(255, 0, 0, 0.5)',
        'rgb(100%, 0%, 0%)',
        'rgb(255 0 0)',
        'rgb(255 0 0 / 50%)',
        'rgb(255 0 0 / 0.5)',
        'RGB(0, 128, 255)',
        'rgb(10.5, 20, 30)',
        'rgb(100% 0 0)'
      ],
      [
        'rgb(256, 0, 0)',
        'rgb(-1, 0, 0)',
        'rgb(255, 0)',
        'rgb(255 0 0 0)',
        'rgb(100%, 0, 0)',
        'rgba(255, 0, 0, 2)',
        'rgb(255 0 0 / )',
        'rgb 255 0 0',
        'rgb(255, 0, 0',
        'rgb(a, b, c)',
        'rgb(101%, 0%, 0%)',
        '#ff0000'
      ]
    )
  ),
  spec(
    'isHslColor',
    g(
      [
        'hsl(120, 100%, 50%)',
        'hsla(120, 100%, 50%, 0.3)',
        'hsl(120deg 100% 50%)',
        'hsl(0.5turn 50% 50% / 0.5)',
        'hsl(3.14rad, 50%, 50%)',
        'hsl(400, 50%, 50%)'
      ],
      [
        'hsl(120, 100, 50)',
        'hsl(120, 101%, 50%)',
        'hsl(120, 100%)',
        'hsl(abc, 50%, 50%)',
        'hsl(120, 100%, 50%, 2)',
        'hsl 120 100% 50%'
      ]
    )
  ),
  spec(
    'isCssColor',
    g(
      [
        'red',
        'RebeccaPurple',
        'transparent',
        'currentColor',
        '#fff',
        '#ffffff80',
        'rgb(1, 2, 3)',
        'hsl(0, 0%, 0%)',
        'lightgoldenrodyellow',
        'grey'
      ],
      ['notacolor', '#ggg', 'rgb(1, 2)', 'redd', '']
    )
  )
];
