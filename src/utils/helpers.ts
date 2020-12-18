// eslint-disable-next-line no-unused-vars
// import { GraphNode } from 'react-d3-graph'
import { flureeFetch } from './flureeFetch'

export function parseFlake(flake: Flake) {
  const shapedFlake: FlakeShape = {
    s: flake[0],
    p: flake[1],
    o: flake[2],
    t: flake[3],
    op: flake[4],
    m: flake[5]
  }
  return shapedFlake
}

export function generateIdQuery(id: number) {
  return {
    selectOne: ['*'],
    from: id
    // opts: { compact: true }
  }
}

export async function parseDrift(flakes: Array<Flake> | null, fetchOpts: any) {
  if (flakes && flakes.length) {
    const idQuery: Dictionary = {}
    const shapedDrift: Array<FlakeShape> = flakes.map((flake) => {
      for (const f of flake) {
        if (typeof f === 'number' && !idQuery[f])
          idQuery[f] = generateIdQuery(f)
      }
      return parseFlake(flake)
    })
    console.log(idQuery)
    try {
      const metaResults = await flureeFetch({ ...fetchOpts, body: idQuery })
      console.log({ metaResults })
      return { shapedDrift, metaResults: metaResults.data }
    } catch (err) {
      console.log(err)
      return { shapedDrift: [], metaResults: {} }
    }
  }
  return { shapedDrift: [], metaResults: {} }
}

export function createFlakeNodes(
  flake: FlakeShape,
  color: string,
  i: number | string
) {
  const flakeNode = {
    id: `flake${i}`,
    // svg: '../assets/fluree-logo.svg',
    color,
    opacity: flake.op ? 1 : 0.5,
    symbolType: 'triangle'
    // fill: color
  }
  return flakeNode
}

export const createGraph = (
  shapedDrift: Array<FlakeShape>,
  meta: object,
  theme: any
) => {
  const nodeMemo: Array<string> = []
  const linkMemo: { [index: string]: Array<string> } = {}
  const nodes: Array<object> = []
  const links: Array<object> = []
  for (const flake in shapedDrift) {
    const id = `flake${flake}`
    nodeMemo.push(id)
    nodes.push(
      createFlakeNodes(
        shapedDrift[flake],
        `${theme.palette.primary.main}`,
        flake
      )
    )
    for (const [key, value] of Object.entries(shapedDrift[flake])) {
      if (value && !!meta[value.toString()]) {
        if (!nodeMemo.includes(value.toString())) {
          nodeMemo.push(value.toString())
          if (value < 0) {
            nodes.push({
              id: meta[value.toString()]._id.toString(),
              color: theme.palette.secondary.main
            })
          } else
            nodes.push({
              id: meta[value.toString()]._id.toString()
            })
        }
        if (!linkMemo[id]) {
          linkMemo[id] = []
        }
        if (!linkMemo[id].includes(value.toString())) {
          linkMemo[id].push(value.toString())
          links.push({
            source: id.toString(),
            target: meta[value.toString()]._id.toString(),
            label: key
          })
        }
      }
    }
  }
  console.log({ nodeMemo, linkMemo })
  return { links, nodes }
}

// const flakes: Array<Flake> = [
//   [105553116267497, 60, 'Tf78E3Duidr4nDf9tdQUA8AJ5mAoR5S7CpJ', -13, true, null],
//   [105553116267497, 65, 123145302310912, -13, true, null],
//   [
//     -13,
//     99,
//     '1e7747cffc6d6de3351549a0334d0fb3627826b476f6d1065930883d8f816456',
//     -13,
//     true,
//     null
//   ],
//   [
//     -13,
//     100,
//     '2391bc070067f5d57aa26fe18bef5d02b8d5417348a2d2891289073df59065b5',
//     -13,
//     true,
//     null
//   ],
//   [-13, 101, 105553116266496, -13, true, null],
//   [-13, 103, 1608055496727, -13, true, null],
//   [
//     -13,
//     106,
//     '{"type":"tx","db":"example/mdm","tx":[{"_id":"_auth","id":"Tf78E3Duidr4nDf9tdQUA8AJ5mAoR5S7CpJ","roles":[["_role/id","root"]]}],"nonce":1608055496727,"auth":"TfKXH47U4W6UgnxeoPSXsrfEuAt5Lm97DGx","expire":1608055526731}',
//     -13,
//     true,
//     null
//   ],
//   [
//     -13,
//     107,
//     '1c3045022100d869cfe6662fc2d675d8495ca8ed40fd7be2cdc5922466797cc854b704bf51be022057b07ffa436500bfb5bc51c6c2a9bc2c10ec06c3cb013da865e3289ef9e80c3d',
//     -13,
//     true,
//     null
//   ],
//   [-13, 108, '{"_auth$1":105553116267497}', -13, true, null],
//   [
//     -14,
//     1,
//     'edc778cbd37ce30367462eb0e41d87f95ac5466e4d33b616fa3d436a18d1a3ea',
//     -14,
//     true,
//     null
//   ],
//   [
//     -14,
//     2,
//     '47e19ce651058c11821e5ffdba0c9587aab6fb6764bd6d409f9425b8dd35e0f0',
//     -14,
//     true,
//     null
//   ],
//   [-14, 3, -14, -14, true, null],
//   [-14, 3, -13, -14, true, null],
//   [-14, 4, 105553116266496, -14, true, null],
//   [-14, 5, 1608055496746, -14, true, null],
//   [-14, 6, 7, -14, true, null],
//   [
//     -14,
//     7,
//     '1b3045022100dfb0388c545150729755a7c0d64bd7054e484f821060758765804eb6a08f367302201aa7dc50ee3cdc4c856fb41c25763f72c019ec32f6ae9a1a4bfe4a59ed7fb719',
//     -14,
//     true,
//     null
//   ],
//   [
//     -14,
//     99,
//     '609d27fab3e13279d54a96defd130ab1a1fdbd227d95349fb0ee6c8ff92960a4',
//     -14,
//     true,
//     null
//   ]
// ]
