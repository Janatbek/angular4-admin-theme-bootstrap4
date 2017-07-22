import { Params } from '@angular/router/router';
import { isNumeric } from 'rxjs/util/isNumeric';

import { UtilityFunctions } from 'app/common/classes/UtilityFunctions';
import { DataGrouping, FilterRule, NameValue } from 'app/common/interfaces/WidgetInterfaces';
import { DataSet } from 'app/common/interfaces/DisplayInterfaces';
import { Descriptive } from 'app/common/classes/Descriptive';

export class DataSetFilter {

    public static FilterOperationMap(): NameValue[] {
        return [
        { name: '=',  value: '==' },
        { name: '!=', value: '!==' },
        { name: '>',  value: 'gt' },
        { name: '>=', value: 'ge' },
        { name: '<',  value: 'lt' },
        { name: '<=', value: 'le' },
        { name: 'text (case sensitive) =',             value: 'eq' },
        { name: 'text (case insensitive) =',           value: 'nceq' },
        { name: 'text (case sensitive) !=',            value: 'ne' },
        { name: 'text (case sensitive) starts with',   value: 'startswith' },
        { name: 'text (case insensitive) starts with', value: 'ncstartswith' },
        { name: 'text (case sensitive) ends with',     value: 'endswith' },
        { name: 'text (case insensitive) ends with',   value: 'ncendswith' },
        { name: 'text (case sensitive) contains',      value: 'contains' },
        { name: 'text (case insensitive) contains',    value: 'nccontains' } ];
    }

    public static GroupDataSet(dataSet: DataSet, dataGrouping: DataGrouping): DataSet {

        if (dataGrouping === undefined ||
            dataGrouping.groupBy === undefined ||
            dataGrouping.groupBy.length === 0 ||
            dataGrouping.aggregations === undefined ||
            dataGrouping.aggregations.length === 0 ||
            dataGrouping.serverSide === true) {
                return dataSet;
        }

        const newData: string[][] = [];
        const returnDataSet: DataSet = { columns: [], data: newData };

        returnDataSet.columns.push(... dataGrouping.groupBy);
        returnDataSet.columns.push(... dataGrouping.aggregations.map( a => `${a.rename}`));

        const filteredGroupBy = dataGrouping.groupBy.filter(g =>  dataSet.columns.indexOf(g) > -1);

        const groupInfoLkp = {} as GroupInfoDictionary;

        // create group key pointer to rows
        dataSet.data.forEach((row, idx) => {
            const rowKey = filteredGroupBy.map(c => row[dataSet.columns.indexOf(c)]).join('|||');
            if (! (rowKey in groupInfoLkp)) {
                groupInfoLkp[rowKey] = new GroupInfo(rowKey)
            }
            groupInfoLkp[rowKey].rows.push(row);

        });

        // Create Grouped rows
        const filterAggregateBy =  dataGrouping.aggregations.filter( a => dataSet.columns.indexOf(a.name) > -1);

        Object.keys(groupInfoLkp).forEach( rowKey => {
            const newRow: string[] = [];

            rowKey.split('|||').forEach( k => newRow.push(k) );

            filterAggregateBy.forEach( aggRule => {

                let set = groupInfoLkp[rowKey].rows
                    .map(r => Number(r[dataSet.columns.indexOf(aggRule.name)]));

                set = set.filter(r => !isNaN(r));

                let value = 0;
                switch (aggRule.operation.toLowerCase()) {
                    case 'mean':
                        value = Descriptive.mean(set);
                        break;
                    case 'median':
                        value = Descriptive.median(set);
                        break;
                    case 'stddev':
                        value = Descriptive.stdDev(set);
                        break;
                    case 'sum':
                        value = set.reduce( (a, c) => a + c, 0);
                        break;
                    case 'min':
                        value = set.reduce( (a, c) => a = c < a ? c : a, set[0]);
                        break;
                    case 'max':
                        value = set.reduce( (a, c) => a = c > a ? c : a, set[0]);
                        break;
                    case 'count':
                        value = set.length;
                        break;
                    default:
                        throw new Error(`aggregation type '${aggRule.operation}' is not recognized.`);

                }
                newRow.push((value === undefined) ? 'NaN' :  value.toString());
            });

            returnDataSet.data.push(newRow);
        });

        return returnDataSet;
    }

    public static FilterDataSet(dataSet: DataSet, filterRules: FilterRule[], context: Params, filters: Params): DataSet {

        if ((filterRules === undefined || filterRules.length === 0) &&
            (filters === undefined || Object.keys(filters).length === 0)) {
            return dataSet;
        }

        const specs = this.GetFilterSpecs(dataSet, filterRules, context, filters);

        if (specs.length === 0) {
            return dataSet;
        }

        const newData: string[][] = [];
        const returnDataSet: DataSet = { columns: dataSet.columns, data: newData };

        this.GetFilteredIndexes(dataSet, specs).forEach( idx =>{
            returnDataSet.data.push(dataSet.data[idx]);
        });

        return returnDataSet;
    }

    public static GetFilterSpecs (dataSet: DataSet, filterRules: FilterRule[], context: Params, filters: Params): FilterSpec[] {

        const specs: FilterSpec[] = [];

        if (filterRules !== undefined) {
            filterRules
                .filter(rule => rule.serverSide === false)
                .forEach(rule => {
                    specs.push(new FilterSpec(rule, undefined, undefined, context, dataSet.columns));
                });
        }

        if (filters !== undefined) {
            for (const key of Object.keys(filters)) {
                if (filters[key] instanceof Array) {
                    filters[key].forEach( whereClause => {
                        specs.push(new FilterSpec(undefined, key, whereClause, context, dataSet.columns));
                    });
                } else {
                    specs.push(new FilterSpec(undefined, key, filters[key], context, dataSet.columns));
                }

            }
        }

        return  specs.filter(s => s.alwaysPass === false);
    }

    public static GetFilteredIndexes(dataSet: DataSet, specs: FilterSpec[]): number[] {

        const indexes: number[] = [];

        const newData: string[][] = [];
        const returnDataSet: DataSet = { columns: dataSet.columns, data: newData };

        dataSet.data.forEach( (record, idx) => {
            if (this.RecordPasses(record, specs)){
                indexes.push(idx);
            }
        });

        return indexes;
    }

    public static RecordPasses(record: string[], specs: FilterSpec[] ): boolean {

        for (let i = 0; i < specs.length; i++) {
            if (!specs[i].Passes(record[specs[i].columnIndex])) {
                return false;
            }
        }
        return true;
    }
}

interface GroupInfoDictionary {
     [index: string]: GroupInfo;
}


class GroupInfo {
    key: string;
    rows: string[][];

    constructor(key: string) {
        this.key = key;
        this.rows = [];
    }
}

export class FilterSpec {

    column: string;
    columnIndex: number;
    whereClause: string;
    whereCompare: number;
    formattedWhereClause: string;
    valid = true;
    predicate: string;
    userExpression: string;
    alwaysPass = false;
    filterMethod: (value: string) => boolean;


    public static UserExpressionToFormatted(userExpression: string): string {
        if (userExpression.startsWith('=')) {
            const formatted =  'eq|' + userExpression.substring(1);
            return formatted;
        } else if (userExpression.endsWith('*') && userExpression.startsWith('*')) {
            if (userExpression.length === 1){
                return 'ncstartswith|';
            } else if (userExpression.length === 2) {
                return 'nccontains|';
            } else  {
                return 'nccontains|' + userExpression.substring(1, userExpression.length - 1);
            }

        } else if (userExpression.endsWith('*')) {
            return 'ncstartswith|' + userExpression.substring(0, userExpression.length - 1 );
        } else if (userExpression.startsWith('*')) {
            return 'ncendswith|' + userExpression.substring(1);
        } else if (userExpression.startsWith('!')) {
            return 'ne|' + userExpression.substring(1);
        } else if (userExpression.startsWith('>=') || userExpression.startsWith('=>')) {
            return 'ge|' + userExpression.substring(2);
        } else if (userExpression.startsWith('<=') || userExpression.startsWith('=<')) {
            return 'le|' + userExpression.substring(2);
        } else if (userExpression.startsWith('>')) {
            return 'gt|' + userExpression.substring(1);
        } else if (userExpression.startsWith('<')) {
            return 'lt|' + userExpression.substring(1);
        } else {
            return 'ncstartswith|' + userExpression;
        }

    }

    public static FormattedExpressionToUser(filterParam: NameValue): NameValue {
        const r = new FilterSpec(undefined, filterParam.name, filterParam.value, undefined, []);
        return { name: filterParam.name, value: r.userExpression };
    }

    public static FromFilters(filters: Params): FilterSpec[] {
        const specs: FilterSpec[] = [];

        for (const key of Object.keys(filters)) {
            if (filters[key] instanceof Array) {
                filters[key].forEach( whereClause => {
                    specs.push(new FilterSpec(undefined, key, whereClause, undefined, []));
                });
            } else {
                specs.push(new FilterSpec(undefined, key, filters[key], undefined, []));
            }
        }

        return specs;
    }

    private SetAlwaysPass() {
        this.filterMethod = v => { return true; };
        this.alwaysPass = true;
    }

    public constructor(rule: FilterRule, existingName: string, existingWhereClause: string, context: Params, columns: string[]) {

        if (existingName !== undefined && existingName.length > 0 && existingWhereClause !== undefined && existingWhereClause.length > 0) {
            this.column = existingName;
            this.columnIndex = columns.indexOf(existingName);
            this.whereClause = existingWhereClause;
            this.CreateFilterMethod();

            if (this.columnIndex === -1) {
                this.SetAlwaysPass();
            }
        } else if (rule === undefined || rule.serverSide === true) {
            this.column = existingName;
            this.whereClause = existingWhereClause;
            // Using to create formatted where clause
            this.CreateFilterMethod();
            // Nothing specified - will just return true
            this.SetAlwaysPass();
        } else if (columns.indexOf(rule.column) === -1) {
            this.SetAlwaysPass();
        } else {
            this.filterMethod = v => { return true; };
            let valueToUse: string = undefined;
            if (rule.contextValueName !== undefined && rule.contextValueName in context) {
                valueToUse = context[rule.contextValueName];
            } else if (rule.value !== undefined  && rule.value.length > 0) {
                valueToUse = rule.value;
            }
            if (valueToUse !== undefined && valueToUse.length > 0) {
                this.column = rule.column;
                this.columnIndex = columns.indexOf(rule.column);
                this.whereClause = rule.operator === undefined ? valueToUse : `${rule.operator}|${valueToUse}`;
                this.CreateFilterMethod();
            }
        }
    }

    Passes(v: string): boolean {
        return this.valid && this.filterMethod(v);
    }

    CreateFilterMethod() {

        this.filterMethod = v => { return true; };

        const dotIndex = this.whereClause.indexOf('|');
        if (dotIndex > -1) {
            this.predicate = this.whereClause.substr(dotIndex + 1);
        }

        if (this.whereClause.toLowerCase().startsWith('eq|')) {
            this.formattedWhereClause = `${this.column} = ${this.predicate}`;
            this.userExpression = `=${this.predicate}`;
            this.filterMethod = v => {
                return v === this.predicate;
            };
        } else if (this.whereClause.toLowerCase().startsWith('ne|')) {
            this.formattedWhereClause = `${this.column} != ${this.predicate}`;
            this.userExpression = `!${this.predicate}`;
            this.filterMethod = v => {
                return v !== this.predicate;
            };
        } else if (this.whereClause.toLowerCase().startsWith('startswith|')) {
            this.formattedWhereClause = `${this.column} starts with ${this.predicate}`;
            this.userExpression = `${this.predicate}`;
            this.filterMethod = v => {
                return v.startsWith(this.predicate);
            };
        } else if (this.whereClause.toLowerCase().startsWith('endswith|')) {
            this.formattedWhereClause = `${this.column} ends with ${this.predicate}`;
            this.userExpression = `*${this.predicate}`;
            this.filterMethod = v => {
                return v.endsWith(this.predicate);
            };
        } else if (this.whereClause.toLowerCase().startsWith('contains|')) {
            this.formattedWhereClause = `${this.column} contains ${this.predicate}`;
            this.userExpression = `*${this.predicate}*`;
            this.filterMethod = v => {
                return v.indexOf(this.predicate) > -1;
            };
        } else if (this.whereClause.toLowerCase().startsWith('nceq|')) {
            this.formattedWhereClause = `${this.column} = ${this.predicate}`;
            this.userExpression = `${this.predicate}`;
            this.filterMethod = v => {
                return v.toLowerCase() === this.predicate.toLowerCase();
            };
        } else if (this.whereClause.toLowerCase().startsWith('ncstartswith|')) {
            this.formattedWhereClause = `${this.column} starts with ${this.predicate}`;
            this.userExpression = `${this.predicate}`;
            this.filterMethod = v => {
                return v.toLowerCase().startsWith(this.predicate.toLowerCase());
            };
        } else if (this.whereClause.toLowerCase().startsWith('ncendswith|')) {
            this.formattedWhereClause = `${this.column} ends with ${this.predicate}`;
            this.userExpression = `*${this.predicate}`;
            this.filterMethod = v => {
                return v.toLowerCase().endsWith(this.predicate.toLowerCase());
            };
        } else if (this.whereClause.toLowerCase().startsWith('nccontains|')) {
            this.formattedWhereClause = `${this.column} contains ${this.predicate}`;
            this.userExpression = `*${this.predicate}*`;
            this.filterMethod = v => {
                return v.toLowerCase().indexOf(this.predicate.toLowerCase()) > -1;
            };
        } else if (this.whereClause.toLowerCase().startsWith('==|')) {
            if (this.trySetAsNumber(this.predicate)) {
                this.userExpression = `${this.predicate}`;
                this.formattedWhereClause = `${this.column} = ${this.predicate}`;
                this.filterMethod = v => {
                    const asNumber = Number(v);
                    if (asNumber === NaN) { return false; } else { return this.whereCompare === asNumber; }
                };
            }
        } else if (this.whereClause.toLowerCase().startsWith('gt|')) {
            if (this.trySetAsNumber(this.predicate)) {
                this.formattedWhereClause = `${this.column} > ${this.predicate}`;
                this.userExpression = `>${this.predicate}`;
                this.filterMethod = v => {
                    const asNumber = Number(v);
                    if (asNumber === NaN) { return false; } else { return asNumber > this.whereCompare; }
                };
            }
        } else if (this.whereClause.toLowerCase().startsWith('lt|')) {
            if (this.trySetAsNumber(this.predicate)) {
                this.formattedWhereClause = `${this.column} < ${this.predicate}`;
                this.userExpression = `<${this.predicate}`;
                this.filterMethod = v => {
                    const asNumber = Number(v);
                    if (asNumber === NaN) { return false; } else { return asNumber < this.whereCompare; }
                };
            }
        } else if (this.whereClause.toLowerCase().startsWith('le|')) {
            if (this.trySetAsNumber(this.predicate)) {
                this.formattedWhereClause = `${this.column} <= ${this.predicate}`;
                this.userExpression = `<=${this.predicate}`;
                this.filterMethod = v => {
                    const asNumber = Number(v);
                    if (asNumber === NaN) { return false; } else { return asNumber <= this.whereCompare; }
                };
            }
        } else if (this.whereClause.toLowerCase().startsWith('ge|')) {
            if (this.trySetAsNumber(this.predicate)) {
                this.formattedWhereClause = `${this.column} >= ${this.predicate}`;
                this.userExpression = `>=${this.predicate}`;
                this.filterMethod = v => {
                    const asNumber = Number(v);
                    if (asNumber === NaN) { return false; } else { return asNumber >= this.whereCompare; }
                };
            }
        } else if (this.whereClause.toLowerCase().startsWith('!=|')) {
            if (this.trySetAsNumber(this.predicate)) {
                this.formattedWhereClause = `${this.column} != ${this.predicate}`;
                this.userExpression = `!${this.predicate}`;
                this.filterMethod = v => {
                    const asNumber = Number(v);
                    if (asNumber === NaN) { return true; } else { return asNumber !== this.whereCompare; }
                };
            }
        } else {
            this.formattedWhereClause = `${this.column} starts with ${this.whereClause}`;
            this.userExpression = `${this.whereClause}`;
            this.filterMethod = v => {
                return v.startsWith(this.whereClause);
            };
        }
    }

    trySetAsNumber(s: string): boolean {
        this.whereCompare = Number(s);

        if (this.whereCompare === NaN)
        {
            this.valid = false;
            return false;
        } else {
            return true;
        }
    }
}