// Copyright 2023 The Nakama Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { OpCode, Mark } from './messages'
import { type State } from './match_handler'

export const aiUserId = 'ai-user-id'
const tfServingAddress: string = 'http://tf:8501/v1/models/ttt:predict'

export const aiPresence: nkruntime.Presence = {
  userId: aiUserId,
  sessionId: '',
  username: aiUserId,
  node: '',
}

function aiMessage(code: OpCode, data: ArrayBuffer): nkruntime.MatchMessage {
  return {
    sender: aiPresence,
    persistence: true,
    status: '',
    opCode: code,
    data,
    reliable: true,
    receiveTimeMs: Date.now(),
  }
}

type cell = number[]
type row = cell[]
type board = row[]

export function aiTurn(
  state: State,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
): void {
  const aiCell = [1, 0]
  const playerCell = [0, 1]
  const undefCell = [0, 0]

  // Convert board state into expected model format
  const b: board = [
    [undefCell, undefCell, undefCell],
    [undefCell, undefCell, undefCell],
    [undefCell, undefCell, undefCell],
  ]

  state.board.forEach((mark, idx) => {
    const rowIdx = Math.floor(idx / 3)
    const cellIdx = idx % 3

    if (mark === state.marks[aiUserId]) b[rowIdx][cellIdx] = aiCell
    else if (mark === null || mark === Mark.UNDEFINED)
      b[rowIdx][cellIdx] = undefCell
    else b[rowIdx][cellIdx] = playerCell
  })

  // Send the vectors to TF
  const headers = { Accept: 'application/json' }

  const resp = nk.httpRequest(
    tfServingAddress,
    'post',
    headers,
    JSON.stringify({ instances: [b] }),
  )

  const body = JSON.parse(resp.body)

  let predictions: number[] = []
  try {
    predictions = body.predictions[0]
  } catch (error) {
    logger.error('received unexpected TF response: %v: %v', error, body)
    return
  }

  // Find the index with the highest predicted value
  let maxVal = -Infinity
  let aiMovePos = -1
  predictions.forEach((val, idx) => {
    if (val > maxVal) {
      maxVal = val
      aiMovePos = idx
    }
  })

  // Append message to m.messages to be consumed by the next loop run
  if (aiMovePos > -1) {
    const move = nk.stringToBinary(JSON.stringify({ position: aiMovePos }))

    state.aiMessage = aiMessage(OpCode.MOVE, move)
  }
}
