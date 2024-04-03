import { Component, Injector, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonTableConfig, CommonTableHook } from 'src/app/shared/shared-table/interfaces/common-table-config';
import { GenericAdditionalOptions, TableInputState } from 'src/app/shared/shared-table/interfaces/common-table-state';
import { GenericTableDataModel } from 'src/app/shared/shared-table/models/common-table.model';
import { AssignAgencyRow } from '../../interfaces/agency-verification-interface';
import { UploadReportService } from '../../services/upload-report.service';
import { CommonBase } from 'src/app/commons/classes/common-base/common-base';
import { ALLOCATE_AGENCY_ROUTER_LINKS } from 'src/app/commons/enums/router-links';
import { ReopenAgencyComponent } from '../reopen-agency/reopen-agency.component';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AllocateAgenciesConfig, UpdateReportConfig } from 'iifl-primesquare-base-ui-configs';
import { ApplicationEntitlementsService } from 'src/app/core-services/entitlemets/application-entitlements/application-entitlements.service';
import { AgencyVerificationEntitlementCodes } from 'src/app/core-services/constants/application-entitlements/application-entitlements.constants';
import { AgencyQueryService } from '../../services/agency-query.service';
import { CommonTablePageState } from 'src/app/shared/shared-table/interfaces/common-table-page-state';
import { TmRow } from '../../interfaces/view-agency-report-details-interface';
import { USER_ROLE } from '../../consts/agencyVerification';
@Component({
  selector: 'ss-update-report',
  templateUrl: './update-report.component.html',
  styleUrls: ['./update-report.component.scss']
})
export class UpdateReportComponent extends CommonBase implements OnInit {
  public readonly UPDATE_REPORT_VIEW: string = ALLOCATE_AGENCY_ROUTER_LINKS.UPDATE_REPORT_VIEW;
  public readonly UPLOAD_REPORT: string = ALLOCATE_AGENCY_ROUTER_LINKS.UPLOAD_REPORT;
  public readonly QUERY: string = ALLOCATE_AGENCY_ROUTER_LINKS.RAISE_QUERY;
  // IIFL Start
  public readonly PREVIOUS_REPORT: string = ALLOCATE_AGENCY_ROUTER_LINKS.PREVIOUS_REPORT;
  // IIFL End
  public confirmInitiateRef!: MatDialogRef<ReopenAgencyComponent, any>;

  public projectId = '';
  public screenMode: any;
  public subsequentReportData: any = [];
  public screenEntitlementCodes = AgencyVerificationEntitlementCodes;
  public tableConfig: CommonTableConfig;
  public tableHook: CommonTableHook<any> = {
    onLoad: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onUpdateReportLoad(state);
    },
    onPaginate: (pageState: CommonTablePageState,
      state: TableInputState<GenericAdditionalOptions>) => {
      return this.onUpdateReportLoad(state);
    },
    onRefresh: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onUpdateReportLoad(state);
    }
  };

  public subsequentTableHook: CommonTableHook<any> = {
    onLoad: () => {
      return this.uploadReportService.subsequentReportData$;
    },
    onPaginate: (pageState: CommonTablePageState,
      state: TableInputState<GenericAdditionalOptions>) => {
      return this.onSubsequentUpdateReportLoad(state);
    },
    onRefresh: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onSubsequentUpdateReportLoad(state);
    }
  };

  /** IIFL START */
  public tmTableConfig: CommonTableConfig;
  public tmTableHook: CommonTableHook<any> = {
    onLoad: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onTmLoad(state);
    },
    onPaginate: (pageState: CommonTablePageState,
      state: TableInputState<GenericAdditionalOptions>) => {
      return this.onTmLoad(state);
    },
    onRefresh: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onTmLoad(state);
    }
  };

  public subsequentUsersTableConfig: CommonTableConfig;
  public subsequentUsersTableHook: CommonTableHook<any> = {
    onLoad: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onSubsequentUsersLoad(state);
    },
    onPaginate: (pageState: CommonTablePageState,
      state: TableInputState<GenericAdditionalOptions>) => {
      return this.onSubsequentUsersLoad(state);
    },
    onRefresh: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onSubsequentUsersLoad(state);
    }
  };
  public userType: any = '';
  public isPseudoAgencyLogin: boolean = false;
  public legalManagerUserType: any = '';
  public agencyUserType: any = '';
  public tmAssignedList: any = [];
  public subsequentTmAssignedList: any = [];

  private userEntitlements: any;
  /** IIFL END */

  constructor(
    _injector: Injector,
    public uploadReportService: UploadReportService,
    private activatedRoute: ActivatedRoute,
    private updateReportConfig: UpdateReportConfig,
    public applicationEntitlementsService: ApplicationEntitlementsService,
    private agencyQueryService: AgencyQueryService,
    public router: Router,
    // IIFL Start
    private allocateAgencyConfig: AllocateAgenciesConfig,
    // IIFL End
  ) {
    super(_injector);
    // IIFL Start
    this.userEntitlements = this.applicationEntitlementsService.fetchUserEntitlements();
    this.isPseudoAgencyLogin = this.userEntitlements?.addlParams?.isPseudoAgencyLogin === 'Yes' ? true : false;
    // IIFL End
    this.getProjectId();
    this.tableConfig = {
      isPageable: true,
      isSortable: false,
      pageSizeOptions: [10],
      pageOptions: {
        pageNumber: 0,
        pageSize: 10,
      },
      sortOptions: {
        sortKey: 'name',
        sortDirection: 'asc'
      },
      tableColumns: this.updateReportConfig.updateReportTableCOnfig,
      refresh: () => { },
    };
    /** IIFL START */
    this.tmTableConfig = {
      isPageable: true,
      isSortable: false,
      pageSizeOptions: [10],
      pageOptions: {
        pageNumber: 0,
        pageSize: 10,
      },
      sortOptions: {
        sortKey: 'name',
        sortDirection: 'asc',
      },
      tableColumns: this.allocateAgencyConfig.iiflUpdateReportTmTableConfig,
      refresh: () => { },
    };

    this.subsequentUsersTableConfig = {
      isPageable: true,
      isSortable: false,
      pageSizeOptions: [10],
      pageOptions: {
        pageNumber: 0,
        pageSize: 10,
      },
      sortOptions: {
        sortKey: 'name',
        sortDirection: 'asc',
      },
      tableColumns: this.allocateAgencyConfig.iiflUpdateReportTmTableConfig,
      refresh: () => { },
    };
    this.userType = sessionStorage.getItem('userType');
    this.legalManagerUserType = USER_ROLE[6].userType;
    this.agencyUserType = USER_ROLE[4].userType;
    /** IIFL END */
    this.screenMode = this.applicationEntitlementsService.getEditableStepCodesEntitlementMode(this.screenEntitlementCodes.stepCodes.viewAgencyAllocation);
    this.getSubsequentReportData();
  }

  // IIFL Start
  ngOnInit(): void {
    this.getTmListLength();
  }
  // IIFL End

  public getProjectId() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.projectId = params['projectId'] || '';
    });
  }

  /**
   * To load the grid records for assign agency.
   */
  private onUpdateReportLoad(
    state: TableInputState<GenericAdditionalOptions>
  ): Observable<GenericTableDataModel<AssignAgencyRow>> {
    const searchState: any = {
      ...state,
      projectId: this.projectId,
    };

    return this.uploadReportService.load(searchState);
  }

  public getSubsequentReportData() {
    const searchState: any = {
      projectId: this.projectId,
    };

    this.uploadReportService.subsequentLoad(searchState).subscribe(
      {
        next: (response: any) => {
          this.subsequentReportData = response.records;
          this.uploadReportService.subsequentReportData.next(response);
        },
        error: () => {
          this.subsequentReportData = [];
        }
      }
    );
  }

  /**
   * To load the grid records for assign agency.
   */
  private onSubsequentUpdateReportLoad(
    state: TableInputState<GenericAdditionalOptions>
  ): Observable<GenericTableDataModel<AssignAgencyRow>> {
    const searchState: any = {
      ...state,
      projectId: this.projectId,
    };

    return this.uploadReportService.subsequentLoad(searchState);
  }

  public openReopenAgenciesConfirmDialog(item: any): MatDialogRef<ReopenAgencyComponent, any> {
    let data = {
      body: 'reopen-agency.body',
      header: 'reopen-agency.reopenAgencyReport',
      rowData: item
    };
    this.confirmInitiateRef = this.dialog.open(ReopenAgencyComponent, {
      width: '600px',
      data,
      disableClose: true
    });
    this.confirmInitiateRef.afterClosed()
      .subscribe((result: any) => {
        if (result) {
          this.tableConfig.refresh();
        }
      });
    return this.confirmInitiateRef;
  }

  /**
   * @param item Added in Base
   * @param userType Added in IIFL
   */
  goToQuery(item: any, userType: any) {
    this.agencyQueryService.agencyData = item;
    // IIFL Start
    if (userType === 'agency') {
      this.uploadReportService.assignedTechnicalManagerData = null;
      this.uploadReportService.agencyData = item;
    } else if (userType !== 'agency') {
      this.uploadReportService.agencyData = item;
      this.uploadReportService.assignedTechnicalManagerData = item;
    }
    // IIFL End
    this.router.navigate([this.getFormattedPath(this.QUERY, { agencyId: item.agencyId, updateReportId: item.id })]);
  }

  /**
   * @param item Added in Base
   * @param userType Added in IIFL
   */
  uploadReport(item: any, userType: any) {
    let allocateId = '';
    // IIFL Start
    if (userType === 'agency') {
      this.uploadReportService.assignedTechnicalManagerData = null;
      this.uploadReportService.agencyData = item;
      allocateId = item.id;
    } else if (userType !== 'agency') {
      this.uploadReportService.agencyData = item;
      this.uploadReportService.assignedTechnicalManagerData = item;
      allocateId = item.allocateAgencyId;
    }
    // IIFL End
    this.router.navigate([this.getFormattedPath(this.UPLOAD_REPORT, { id: allocateId })]);
  }

  checkTableActionEntitlement(actionCode: any, tableActions: any) {
    if (this.applicationEntitlementsService.checkTableActionEntitlement(actionCode, tableActions, this.screenMode) === true) {
      return true;
    } else {
      return false;
    }
  }

  /** IIFL START */
  public onTmLoad(
    state: TableInputState<GenericAdditionalOptions>
  ): Observable<GenericTableDataModel<TmRow>> {
    const searchState: any = {
      ...state,
      projectId: this.projectId,
    };

    return this.uploadReportService.tmUpdateReportload(searchState);
  }

  public onSubsequentUsersLoad(
    state: TableInputState<GenericAdditionalOptions>
  ): Observable<GenericTableDataModel<TmRow>> {
    const searchState: any = {
      ...state,
      projectId: this.projectId,
    };

    return this.uploadReportService.subsequentUsersUpdateReportload(searchState);
  }

  public previousReport(item: any, user: any) {
    if (user === 'agency') {
      this.uploadReportService.agencyData = item;
      this.uploadReportService.assignedTechnicalManagerData = null;
    } else if (user !== 'agency') {
      this.uploadReportService.assignedTechnicalManagerData = item;
      this.uploadReportService.agencyData = null;
    }
    this.router.navigate([this.getFormattedPath(this.PREVIOUS_REPORT, { id: item.id })]);
  }

  public getTmListLength() {

    this.uploadReportService.tmUpdateReportload({}).subscribe(
      {
        next: (response: any) => {
          this.tmAssignedList = response.records;
        },
        error: () => {
          this.tmAssignedList = [];
        }
      }
    );
      
    this.uploadReportService.subsequentUsersUpdateReportload({}).subscribe(
      {
        next: (response: any) => {
          this.subsequentTmAssignedList = response.records;
        },
        error: () => {
          this.subsequentTmAssignedList = [];
        }
      }
    );
   
    
  }

  public goToView(item: any, userType: any) {
    let allocateId = '';
    if (userType === 'agency') {
      this.uploadReportService.assignedTechnicalManagerData = null;
      this.uploadReportService.agencyData = item;
      allocateId = item.id;
    } else if (userType !== 'agency') {
      this.uploadReportService.agencyData = item;
      this.uploadReportService.assignedTechnicalManagerData = item;
      allocateId = item.allocateAgencyId;
    }
    this.router.navigate([this.getFormattedPath(this.UPDATE_REPORT_VIEW, { id: allocateId })]);
  }
  /** IIFL END */
}
