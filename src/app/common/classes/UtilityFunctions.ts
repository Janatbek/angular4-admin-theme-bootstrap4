import { Params } from '@angular/router';

import * as UI from 'app/common/interfaces/UserInterfaces';
import * as WI from 'app/common/interfaces/WidgetInterfaces';

export class UtilityFunctions {

    static DebugLog(message: string, params?: Params) {
        if (params === undefined || Object.keys(params).length === 0) {
            console.log(`${message}`);
        } else {
            console.log(`${message}: ${this.SortedParamsString(params)}`);
        }
    }
    static SortedParamsString(params: Params): string {
        return Object.keys(params).sort().map(k => k + '=' + params[k]).join('|');
    }

    static MatchWidgetConfigurations(context: Params, masterWidgetConfigurationList: WI.WidgetConfiguration[]): WI.WidgetConfiguration[] {

        const ret: WI.WidgetConfiguration[] = [];
        masterWidgetConfigurationList.map(masterWC => {
            if (UtilityFunctions.MatchWidgetConfiguration(context, masterWC)) {
                ret.push(masterWC);
            }
        });

        return ret;
    }

    static ContextMatchedGroups(wr: UI.WidgetRegistration, context: Params): UI.WidgetGroup[] {
        return wr.groupedWidgets
            .filter(gw => UtilityFunctions.widgetGroupInContext(gw, context) === true)
            .sort((a, b) => { return a.index - b.index; });
    }

    static widgetGroupInContext(widgetGroup: UI.WidgetGroup, context: Params) {
        const contextKeysForGroup = widgetGroup.contextKey.split('|').sort().join('|');
        const currentContextKeys = Object.keys(context).sort().join('|');
        return (contextKeysForGroup === currentContextKeys);
    }

    static ListContains(list: string[], value: string) {
        return (list.findIndex(x => x === value) > -1) || (list.findIndex(x => x === '*') > -1);
    }

    static MatchWidgetConfiguration(context: Params, masterWC: WI.WidgetConfiguration) {


        const remainingKeys = Object.keys(context).map(x => x.toLowerCase()).slice();

        let matches = true;

        let whyNot = '';

        if (!masterWC.contextMatchingRules || masterWC.contextMatchingRules.length === 0) {
            matches = false;
            whyNot = 'No context matching rules defined for widget';
        } else {

            for (const rule of masterWC.contextMatchingRules) {

                // Check if context key exists
                const exists = Object.keys(context).find(e => e.toLowerCase() === rule.contextName.toLowerCase());

                // Knock off the key from remaining - at the end we see if any are remaining that don't have a rule
                // as a way of failing the match
                if (exists && remainingKeys.indexOf(rule.contextName.toLowerCase()) > -1) {
                    remainingKeys.splice(remainingKeys.indexOf(rule.contextName.toLowerCase()), 1);
                }

                if (!exists && !rule.optional) {
                    matches = false;
                    whyNot = `${rule.contextName} isn't optional and doesn't exist`;
                    break;
                } else if (
                    rule.valueMatch && context[exists] &&
                    context[exists].toLowerCase() !== rule.valueMatch.toLowerCase()) {

                    matches = false;
                    whyNot = `${rule.contextName}.${rule.valueMatch}" didn't match "${context[exists]}"`;
                    break;
                }
            }

            if (matches) {
                if (remainingKeys.length > 0) {
                    matches = false;
                    whyNot = 'extra keys in context not accounted for: ' + JSON.stringify(remainingKeys);
                }
            }
        }

        // if (!matches) { console.log(whyNot); }

        return matches;
    }
}

export class Dictionary<K, V> {
    private _keys: K[];
    private _values: V[];

    constructor() {
        this._keys = [];
        this._values = [];
    }

    upsert(k: K, v: V) {
        const idx = this._keys.indexOf(k);
        if (idx === -1) {
            this._keys.push(k);
            this._values.push(v);
        } else {
            this._values[idx] = v;
        }
    }

    keys(): K[] {
        return this._keys.slice();
    }

    values(): V[] {
        return this._values.slice();
    }

    remove(k: K) {
        const idx = this._keys.indexOf(k);
        if (idx > -1) {
            this._keys = this._keys.slice(idx, 1);
            this._values = this._values.slice(idx, 1);
        }
    }

    get(k: K): V {
        const idx = this._keys.indexOf(k);
        if (idx > -1) {
            return this._values[idx];
        } else {
            return undefined;
        }
    }

    containsKey(k: K) {
        return (this._keys.indexOf(k) > -1);
    }


}
