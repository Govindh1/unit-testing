import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { UpdateReportComponent } from './update-report.component';
import { ProjectsTestingModule } from '../../../projects-testing.module';
import { of } from 'rxjs';
import { UploadReportService } from '../../services/upload-report.service';
import { AllocateAgenciesConfig, UpdateReportConfig } from 'iifl-primesquare-base-ui-configs';
import { ReopenAgencyComponent } from '../reopen-agency/reopen-agency.component';
import { Router, Routes } from '@angular/router';
import { RaiseAgencyQueryComponent } from '../raise-agency-query/raise-agency-query.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { IiflPreviousReportsComponent } from '../iifl-previous-reports/iifl-previous-reports.component';
import { AgencyQueryService } from '../../services/agency-query.service';

let routerLinks: Routes = [
  {
    path: 'projects/agency/agency/raise-agency-query/1/1',
    component: RaiseAgencyQueryComponent
  },
  // IIFL Start
  {
    path: 'projects/agency/agency/previous-report/undefined',
    component: IiflPreviousReportsComponent,
  }
  // IIFL End
];
describe('UpdateReportComponent', () => {
  let component: UpdateReportComponent;
  let fixture: ComponentFixture<UpdateReportComponent>;
  let uploadReportService: UploadReportService;
  // IIFL Start
  let agencyQueryService: AgencyQueryService;
  let router: Router;
  // IIFL End

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateReportComponent, ReopenAgencyComponent],
      imports: [
        ProjectsTestingModule,
        RouterTestingModule.withRoutes(routerLinks),
      ],
      providers: [
        UpdateReportConfig,
        // IIFL Start
        AllocateAgenciesConfig,
        AgencyQueryService
        // IIFL End
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    uploadReportService = TestBed.inject(UploadReportService);
    // IIFL Start
    agencyQueryService = TestBed.inject(AgencyQueryService);
    router = TestBed.inject(Router);
    // IIFL End
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call onUpdateReportLoad onLoad()', fakeAsync(() => {
    let tableData = {};
    spyOn(uploadReportService, 'load').and.returnValue(of(tableData));
    tick();
    let hook = component.tableHook;
    if (hook.onLoad) {
      hook.onLoad({}).subscribe(result => {
        expect(result).toEqual(tableData);
      });
    }
  }));

  it('should call onUpdateReportLoad onPaginate()', fakeAsync(() => {
    let tableData = {};
    spyOn(uploadReportService, 'load').and.returnValue(of(tableData));
    tick();
    let pageState = { pageNumber: 1, pageSize: 10 };
    let hook = component.tableHook;
    if (hook.onPaginate) {
      hook.onPaginate(pageState, {}).subscribe(result => {
        expect(result).toEqual(tableData);
      });
    }
  }));

  it('should call onUpdateReportLoad onRefresh()', fakeAsync(() => {
    let tableData = {};
    spyOn(uploadReportService, 'load').and.returnValue(of(tableData));
    tick();
    let hook = component.tableHook;
    if (hook.onRefresh) {
      hook.onRefresh({}).subscribe(result => {
        expect(result).toEqual(tableData);
      });
    }
  }));

  it('should call onSubsequentUpdateReportLoad onLoad()', fakeAsync(() => {
    let tableData: any = [];
    spyOn(uploadReportService, 'load').and.returnValue(of(tableData));
    tick();
    let hook = component.subsequentTableHook;
    if (hook.onLoad) {
      hook.onLoad({}).subscribe(result => {
        expect(result).toEqual(tableData);
      });
    }
  }));

  it('should call onSubsequentUpdateReportLoad onPaginate()', fakeAsync(() => {
    let tableData = {};
    spyOn(uploadReportService, 'load').and.returnValue(of(tableData));
    tick();
    let pageState = { pageNumber: 1, pageSize: 10 };
    let hook = component.subsequentTableHook;
    if (hook.onPaginate) {
      hook.onPaginate(pageState, {}).subscribe(result => {
        expect(result).toEqual(tableData);
      });
    }
  }));

  it('should call onSubsequentUpdateReportLoad onRefresh()', fakeAsync(() => {
    let tableData = {};
    spyOn(uploadReportService, 'load').and.returnValue(of(tableData));
    tick();
    let hook = component.subsequentTableHook;
    if (hook.onRefresh) {
      hook.onRefresh({}).subscribe(result => {
        expect(result).toEqual(tableData);
      });
    }
  }));

  it('should call on goToQuery', fakeAsync(() => {
    spyOn(component.router, 'navigate').and.callThrough();
    let item = {
      agencyId: 1,
      id: 1
    };
    // @param empty string added in IIFL
    component.goToQuery(item, '');
    fixture.detectChanges();
    tick();
    expect(component.router.navigate).toHaveBeenCalledWith([component.getFormattedPath(component.QUERY, { agencyId: '1', updateReportId: '1' })]);
  }));

  it('should open dialog', fakeAsync(() => {
    let dialogData = {};
    spyOn(component, 'openReopenAgenciesConfirmDialog').and.callThrough();
    component.openReopenAgenciesConfirmDialog(dialogData);
    fixture.detectChanges();
    tick();
    expect(component.openReopenAgenciesConfirmDialog).toHaveBeenCalledWith(dialogData);
  }));

  it('should close dialog', fakeAsync(() => {
    spyOn(component.dialog, 'open')
      .and
      .returnValue({
        afterClosed: () => of(true)
      } as MatDialogRef<typeof component>);
    component.openReopenAgenciesConfirmDialog({});
    fixture.detectChanges();
    component.confirmInitiateRef.afterClosed().subscribe(result => {
      expect(result).toEqual(true);
    });
  }));
  
  it('Call an checkTableActionEntitlement else method', fakeAsync(() => {
    spyOn(component, 'checkTableActionEntitlement').and.callThrough();
    component.checkTableActionEntitlement('', []);
  }));

  it('Call an checkTableActionEntitlement method', fakeAsync(() => {
    spyOn(component.applicationEntitlementsService, 'checkTableActionEntitlement').and.returnValue(true);
    spyOn(component, 'checkTableActionEntitlement').and.callThrough();
    component.checkTableActionEntitlement('EDITEXPOSURE', [{
      'actionCode': 'EDITEXPOSURE',
      'mode': 'VIEW'
    }]);
  }));

  // IIFL Start
  it('should call viewAgencyReportsList()', fakeAsync(() => {
    let data = {
    };
    let searchState = {};
    spyOn(uploadReportService, 'tmUpdateReportload').and.returnValue(of(data));
    tick();
    component.onTmLoad(searchState);
    let hook = component.tableHook;
    if (hook.onLoad) {
      hook.onLoad({}).subscribe((result) => {
        expect(result).toEqual(data);
      });
    }
  }));

  it('should call previousReport()', () => {
    let item = {
    };
    let user = 'agency';
    spyOn(component, 'previousReport').and.callThrough();
    component.previousReport(item, user);
    expect(component.previousReport).toHaveBeenCalled();
  });

  it('should call previousReport() else', () => {
    let item = {
    };
    let user = 'TM';
    spyOn(component, 'previousReport').and.callThrough();
    component.previousReport(item, user);
    expect(component.previousReport).toHaveBeenCalled();
  });

  it('should navigate to UPDATE_REPORT_VIEW for agency', () => {
    const item = { id: '123'};
    const userType = 'agency';
    const navigateSpy = spyOn(router, 'navigate');
    component.goToView(item, userType);
    expect(uploadReportService.assignedTechnicalManagerData).toBeNull();
    expect(uploadReportService.agencyData).toBe(item);
    expect(navigateSpy).toHaveBeenCalledWith([component.getFormattedPath(component.UPDATE_REPORT_VIEW, { id: item.id })]);
  });

  it('should navigate to UPDATE_REPORT_VIEW for technicalManager', () => {
    const item = { allocateAgencyId: '456' };
    const userType = 'technicalManager';
    const navigateSpy = spyOn(router, 'navigate');
    component.goToView(item, userType);
    expect(uploadReportService.agencyData).toBe(item);
    expect(uploadReportService.assignedTechnicalManagerData).toBe(item);
    expect(navigateSpy).toHaveBeenCalledWith([component.getFormattedPath(component.UPDATE_REPORT_VIEW, { id: item.allocateAgencyId })]);
  });

  it('should navigate to UPLOAD_REPORT for agency', () => {
    const item = { id: '123'};
    const userType = 'agency';
    const navigateSpy = spyOn(router, 'navigate');
    component.uploadReport(item, userType);
    expect(uploadReportService.assignedTechnicalManagerData).toBeNull();
    expect(uploadReportService.agencyData).toBe(item);
    expect(navigateSpy).toHaveBeenCalledWith([component.getFormattedPath(component.UPLOAD_REPORT, { id: item.id })]);
  });

  it('should navigate to UPLOAD_REPORT for technicalManager', () => {
    const item = { allocateAgencyId: '456'};
    const userType = 'technicalManager';
    const navigateSpy = spyOn(router, 'navigate');
    component.uploadReport(item, userType);
    expect(uploadReportService.agencyData).toBe(item);
    expect(uploadReportService.assignedTechnicalManagerData).toBe(item);
    expect(navigateSpy).toHaveBeenCalledWith([component.getFormattedPath(component.UPLOAD_REPORT, { id: item.allocateAgencyId })]);
  });

  it('should navigate to QUERY for agency', () => {
    const item = { id: '123', agencyId: '456', /* other properties as needed */ };
    const userType = 'agency';
    const navigateSpy = spyOn(router, 'navigate');

    component.goToQuery(item, userType);

    expect(agencyQueryService.agencyData).toBe(item);
    expect(uploadReportService.assignedTechnicalManagerData).toBeNull();
    expect(uploadReportService.agencyData).toBe(item);
    expect(navigateSpy).toHaveBeenCalledWith([component.getFormattedPath(component.QUERY, { agencyId: item.agencyId, updateReportId: item.id })]);
  });
  it('should navigate to QUERY for technicalManager', () => {
    const item = { id: '789', agencyId: '101', /* other properties as needed */ };
    const userType = 'technicalManager';
    const navigateSpy = spyOn(router, 'navigate');

    component.goToQuery(item, userType);

    expect(agencyQueryService.agencyData).toBe(item);
    expect(uploadReportService.agencyData).toBe(item);
    expect(uploadReportService.assignedTechnicalManagerData).toBe(item);
    expect(navigateSpy).toHaveBeenCalledWith([component.getFormattedPath(component.QUERY, { agencyId: item.agencyId, updateReportId: item.id })]);
  });
  // IIFL End
});
