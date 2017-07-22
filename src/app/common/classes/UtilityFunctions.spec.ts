import { UtilityFunctions } from 'app/common/classes/UtilityFunctions';
import { Params } from '@angular/router';

describe('UtilityFunctions.UtilityFunctions', () => {
    let params: Params = [];

    beforeEach(() => {
        params = [];
        params['source'] = 'probe';
        params['facility'] = 'fab 10';
        params['design'] = 'B16A';
        params['step'] = 'FPC.00';
    });

    it('should produce the exact string', () => {
        const expected = 'design=B16A|facility=fab 10|source=probe|step=FPC.00';
        expect(UtilityFunctions.SortedParamsString(params)).toBe(expected);
    });
});
