import { Params } from '@angular/router';

import { NameValue } from 'app/common/interfaces/WidgetInterfaces';
import { GroupedKey, DataSet } from 'app/common/interfaces/DisplayInterfaces';

export class DataSetConverter {

    static ConvertToGroupKeys(groupBy: string[], leafContext: string[], permanentContext: NameValue[], dataSet: DataSet): GroupedKey[] {
        let GroupedKeyList: GroupedKey[] = [];

        if (dataSet !== undefined) {
            const ctxt: Params = [];

            permanentContext.forEach( nv => {
                ctxt[nv.name] = nv.value;
            });

            GroupedKeyList =
                this.AddFromTable(groupBy, leafContext, dataSet.columns, dataSet.data, groupBy[0], groupBy.slice(1), ctxt, 0, undefined);
        }

        return GroupedKeyList;
    }

    static AddFromTable(
            groupBy: string[], 
            leafContext: string[],
            columns: string[], data: string[][],
            columnName: string,
            remainingGroupByColumns: string[],
            ctxt: Params,
            depth: number,
            parentGC: GroupedKey): GroupedKey[] {

        const temp: GroupedKey[] = [];
        const distinct: string[] = [];
        const colIdx = columns.indexOf(columnName);
        const hasChildren = remainingGroupByColumns.length > 0 && depth < 5;

        for (const row of data) {
            if (distinct.indexOf(row[colIdx]) === -1) {
                distinct.push(row[colIdx]);
            }
        }

        for (const value of distinct.sort()) {
            const childCtxt: Params = [];

            for (const key of Object.keys(ctxt)) {
                childCtxt[key] = ctxt[key];
            }

            childCtxt[columnName] = value;

            const thisGC = new GroupedKey(columnName, value, parentGC);
            temp.push(thisGC);
            thisGC.context = childCtxt;

            const filtered = data.filter(x => x[colIdx] === value);

            if (hasChildren) {
                thisGC.children =
                    this.AddFromTable(
                        groupBy, leafContext, columns, filtered, remainingGroupByColumns[0],
                        remainingGroupByColumns.slice(1), childCtxt, depth + 1, thisGC);

            } else {
                for (const col of leafContext) {
                    thisGC.context[col] = filtered[0][columns.indexOf(col)];
                }
            }
        }
        return temp;
    }

}
