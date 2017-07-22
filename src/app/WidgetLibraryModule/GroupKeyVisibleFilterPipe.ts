import { Pipe, PipeTransform } from '@angular/core';
import { GroupedKey } from 'app/common/interfaces/DisplayInterfaces';

@Pipe({name: 'groupKeyFilter', pure: false})
export class GroupKeyVisibleFilterPipe  implements PipeTransform {
    transform(items: GroupedKey[]): GroupedKey[] {
        if (items.length > 0) {
            return items.filter(gk => gk.visible === true);
        }
    }
}
