// Copyright 2020 The Nakama Authors
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

import { moduleName, matchInit, matchJoinAttempt, matchJoin, matchLeave, matchLoop, matchTerminate, matchSignal } from './match_handler';
import { rpcFindMatch } from './match_rpc';
import { rpcReward } from './daily_rewards';

const rpcIdRewards = 'rewards_js';
const rpcIdFindMatch = 'find_match_js';

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    initializer.registerRpc(rpcIdRewards, rpcReward);

    initializer.registerRpc(rpcIdFindMatch, rpcFindMatch);

    initializer.registerMatch(moduleName, {
        matchInit,
        matchJoinAttempt,
        matchJoin,
        matchLeave,
        matchLoop,
        matchTerminate,
        matchSignal,
    });

    initializer.registerRpc('version', version);

    logger.info('JavaScript logic loaded.');
}

/**
 * Version API
 * @param ctx
 * @param logger
 * @param nk
 * @param payload
 */
const version: nkruntime.RpcFunction =
    function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string = ""): string {
        let input: any = {}
        if (payload) {
            JSON.parse(payload)
        }
        logger.info(`${process.env.VERSION}-${process.env.BUILD_TIME}: input: %q`, input);
        let result = {
            version: process.env.VERSION,
            time: process.env.BUILD_TIME,
            env: process.env.MODE
        }

        return JSON.stringify(result);
    }


// Reference InitModule to avoid it getting removed on build
!InitModule && InitModule.bind(null);
