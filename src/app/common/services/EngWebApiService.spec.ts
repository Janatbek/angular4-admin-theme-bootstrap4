import { AppStateService } from './AppStateService';

import { TestBed, async, inject } from '@angular/core/testing';
import {
  BaseRequestOptions,
  HttpModule,
  Http,
  Response,
  ResponseOptions
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { EngWebApiService } from './EngWebApiService';

describe('EngWebApiService', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [
                EngWebApiService,
                {
                    provide: Http,
                    useFactory: (mockBackend, options) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                MockBackend,
                BaseRequestOptions,
                AppStateService
            ]
        });
    });

    xdescribe('GetDataSet()', () => {
        it ('should return an Observable<DataSet>',
            inject([EngWebApiService, MockBackend], (engWebApiService, mockBackend) => {
                const mockResponse = {
                    'columns' : ['Facility', 'Design', 'Step', 'StartLot', 'Lot', 'Wafer'],
                    'data' : [
                        ['FAB 10', 'B16A', 'XDR3PP.00', '8245821', '8245821.003', '5821-23'],
                        ['FAB 10', 'B16A', 'XDR8PC.00', '8095131', '8095131.023', '5131-12'],
                    ]
                };

                mockBackend.connections.subscribe((connection) => {
                    connection.mockRespond(new Response(new ResponseOptions({
                        body: JSON.stringify(mockResponse)
                    })));
                });

                engWebApiService.GetDataSet('ProbeKeys').subscribe((dataSet) => {
                    expect(dataSet.columns.length).toBe(6);
                });
            })
        );
    });

});
