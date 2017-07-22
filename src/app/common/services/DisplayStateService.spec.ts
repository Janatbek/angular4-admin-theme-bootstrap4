
// Application classes
import { DisplayStateService } from 'app/common/services/DisplayStateService';
import { AppStateService } from 'app/common/services/AppStateService';
import { EngWebApiService } from 'app/common/services/EngWebApiService';
import { DataSet, SideNavWidgetConfig } from 'app/common/interfaces/DisplayInterfaces';

// Testing classes
import { TestBed, async, inject } from '@angular/core/testing';
import {
  BaseRequestOptions,
  HttpModule,
  Http,
  Response,
  ResponseOptions
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

// Angular helper classes
import { ActivatedRoute, Data, Router, Params } from '@angular/router';
import { Observable } from 'rxjs/Rx';

class MockActivatedRoute extends ActivatedRoute {
    constructor() {
        super();
        this.params = Observable.of({id: '5'});
    }
}

describe('displayStateService', () => {

    // let snConfig: SideNavConfig;
    // let snConfigList: SideNavConfig[];
    let probeDS: DataSet;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpModule,
                RouterTestingModule.withRoutes([])
            ],
            providers: [
                EngWebApiService,
                {
                    provide: Http,
                    useFactory: (mockBackend, options) => {
                        return new Http(mockBackend, options);
                    },
                    deps: [MockBackend, BaseRequestOptions]
                },
                {
                    provide: ActivatedRoute,
                    use: MockActivatedRoute
                },
                MockBackend,
                BaseRequestOptions,
                AppStateService,
                DisplayStateService,
                {
                    provide: Router,
                    useClass: class { navigate = jasmine.createSpy('navigate'); }
                }
            ]
        });

        // snConfig = {
        //     'displayName' : 'Probe 24hrs(by design)',
        //     'name' : 'Probe24hrsByDesign',
        //     'permanentContext' : [{ name: 'Source', value: 'Probe' }],
        //     'dataSetName' : 'ProbeKeys',
        //     'groupBy' : [
        //         'Design',
        //         'Step'
        //     ],
        //     'userInput' : false,
        //     'leafContext' : []
        // };

        // snConfigList = [snConfig];

        probeDS = {
            'columns' : [
                'Facility', 'Design', 'Step', 'StartLot', 'Lot', 'Wafer'
            ],
            'data' : [
                [ 'FAB 10', 'B16A', 'XDR3PP.00', '8245821', '8245821.003', '5821-23' ],
                [ 'FAB 10', 'B16A', 'XDR8PC.00', '8095131', '8095131.023', '5131-12' ],
            ]
        };
    });

    // it ('should handle side nav display updates',
    //     inject(
    //         [DisplayStateService, EngWebApiService, MockBackend],
    //         (displayStateService: DisplayStateService, engWebApiService: EngWebApiService, mockBackend) => {

    //         // mockBackend.connections.subscribe((connection) => {
    //         //     connection.mockRespond(new Response(new ResponseOptions({
    //         //         body: JSON.stringify(probeDS)
    //         //     })));
    //         // });

    //         // Front load all the data normally from the eng backend
    //         displayStateService.appState.sideNavWidgetConfig = snConfigList;
    //         displayStateService.appState.sideNavDataSets.upsert(snConfig.dataConsumerConfiguration.dataPolicy, probeDS);
    //         // displayStateService.appState.current.sideNav.Config = snConfig;
    //         // displayStateService.appState.current.sideNav.ConfigName = 'Something Besides what it should be';
    //         // displayStateService.appState.current.sideNav.DataSet = probeDS;
    //         // displayStateService.appState.current.sideNav.DataSetName = snConfig.dataSetName;

    //         displayStateService.RouteSideNavDisplay(true);
    //         expect(displayStateService.appState.current.sideNav.displayed).toBeTruthy();

    //         displayStateService.RouteSideNavDisplay(false);
    //         expect(displayStateService.appState.current.sideNav.displayed).toBeFalsy();

    //     })
    // );

    //     it ('should handle building grouped key list after any routing call',
    //     inject(
    //         [DisplayStateService, EngWebApiService, MockBackend],
    //         (displayStateService: DisplayStateService, engWebApiService: EngWebApiService, mockBackend) => {

    //         // mockBackend.connections.subscribe((connection) => {
    //         //     connection.mockRespond(new Response(new ResponseOptions({
    //         //         body: JSON.stringify(probeDS)
    //         //     })));
    //         // });

    //         // Front load all the data normally from the eng backend
    //         displayStateService.appState.sideNavConfigList = snConfigList;
    //         displayStateService.appState.sideNavDataSets.upsert(snConfig.dataSetName, probeDS);

    //         // displayStateService.appState.current.sideNav.Config = snConfig;
    //         // displayStateService.appState.current.sideNav.ConfigName = snConfig.name;
    //         // displayStateService.appState.current.sideNav.DataSet = probeDS;
    //         // displayStateService.appState.current.sideNav.DataSetName = snConfig.dataSetName;

    //         displayStateService.RouteSideNav('Probe24hrsByDesign');

    //         expect(displayStateService.appState.current.sideNav.GroupedKeyList.length).toBe(1);
    //         expect(displayStateService.appState.current.sideNav.GroupedKeyList[0].granularity ).toBe('Design');
    //         expect(displayStateService.appState.current.sideNav.GroupedKeyList[0].name ).toBe('B16A');
    //         expect(displayStateService.appState.current.sideNav.GroupedKeyList[0].key ).toBe('Design_B16A');
    //         expect(displayStateService.appState.current.sideNav.GroupedKeyList[0].children.length).toBe(2);
    //         expect(displayStateService.appState.current.sideNav.GroupedKeyList[0].children[0].granularity).toBe('Step');
    //         expect(displayStateService.appState.current.sideNav.GroupedKeyList[0].children[0].name).toBe('XDR3PP.00');

    //     })
    // );

});
