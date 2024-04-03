import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { RestApiConnectorService } from 'src/app/core-services/services/rest-api-connector/rest-api-connector.service';
import { LocaleFormatterService } from 'src/app/shared/services/locale-formatter/locale-formatter.service';
import { GenericAdditionalOptions, TableInputState } from 'src/app/shared/shared-table/interfaces/common-table-state';
import { GenericTableDataModel } from 'src/app/shared/shared-table/models/common-table.model';
import { AssignAgencyRow, LegalManagerRow, SkipAgencyRow, TmRow } from '../interfaces/agency-verification-interface';
import * as moment from 'moment';
import { GenericDropdownOption } from 'src/app/commons/interfaces/generic-dropdown-option';
import { PROJECTS } from '../commons/api/apiEndpoints';
import { DatePipe } from '@angular/common';
import { AgencyVerificationEntitlementCodes, ProjectStickyFooterEntitlementCode } from 'src/app/core-services/constants/application-entitlements/application-entitlements.constants';
import { ProjectsCommonService } from '../../project-commons/services/projects-common/projects-common.service';
import { CommonService } from 'src/app/commons/services/common.service';
import { AuthActions, AuthCodes, ProjAuthCodes } from 'src/app/core-services/constants/authentication/authorization-codes.constants';
import { ProjAuthorizationConstants } from 'src/app/core-services/constants/authentication/projects-authorization-constants';
// IIFL Start
import { USER_ROLE, AGENCY_TYPE } from '../consts/agencyVerification';
import { UploadReportService } from './upload-report.service';
import { ApplicationEntitlementsService } from 'src/app/core-services/entitlemets/application-entitlements/application-entitlements.service';
import { UsersAuthorizationConstants } from 'src/app/core-services/constants/authentication/users-authorization-constants';
// IIFL Start

@Injectable({
  providedIn: 'root'
})
export class AgencyVerificationService {
  public agencyData: any;
  public screenEntitlementCodes = AgencyVerificationEntitlementCodes;
  private projectStickyFooterEntitlementCode = ProjectStickyFooterEntitlementCode;
  /** IIFL START */
  public agencyType = '';
  /** IIFL END */

  constructor(private restApiConnectorService: RestApiConnectorService,
    private localeFormatterService: LocaleFormatterService,
    public projectsCommonService: ProjectsCommonService,
    public uploadReportService: UploadReportService,
    public datePipe: DatePipe,
    private commonService: CommonService,
    /** IIFL START */
    public applicationEntitlementsService: ApplicationEntitlementsService
  /** IIFL END */
  ) { }

  public getProjectDocumentsList(state: any, agencyDetails: any): Observable<any> {
    let payload: any = this.assignDocumentsPayload(state, agencyDetails);
    const requestUrl: string = PROJECTS.allocateAgency.projectDocuments;
    return this.restApiConnectorService.post(requestUrl, payload).pipe(
      map((response: any) => this.documentsSummaryMapper(response?.data)),
      catchError((error: any) => throwError(() => error))
    );
  }

  private documentsSummaryMapper(response: any): GenericTableDataModel<any> {
    const data: GenericTableDataModel<any> = {
      totalCount: response?.totalElements,
      records: response?.content || []
    };
    return data;
  }

  /**
  * To load the assign agency grid records.
  */
  public load(state: TableInputState<GenericAdditionalOptions>): Observable<GenericTableDataModel<AssignAgencyRow>> {
    let payload = this.generatePayloadForAllocateAgency(state);
    const requestUrl: string = PROJECTS.allocateAgency.allocateAgencyList;
    return this.restApiConnectorService.post(requestUrl, payload).pipe(
      map((response: any) => this.assignAgencyMapper(response)),
      catchError((error: any) => throwError(() => error))
    );
  }

  /**
 * To get the summary of assign agency grid records.
 */
  public assignAgencyMapper(response: any): GenericTableDataModel<AssignAgencyRow> {
    const data: GenericTableDataModel<any> = {
      totalCount: response?.data?.totalElements,
      records: this.recordsMapper(response?.data?.content || []),

    };
    return data;
  }

  public recordsMapper(records: any[]): AssignAgencyRow[] {
    const transformedRecords: AssignAgencyRow[] = records.map((record: any) => {
      record.assignedDate = moment(record.assignedDate).utc().format();
      const transformedRecord: AssignAgencyRow = {
        id: record?.allocateAgencyId,
        agencyTypeId: record?.agencyType?.agencyTypeId,
        agencyType: record?.agencyType?.name,
        agencyId: record?.agency?.agencyId,
        allocateAgencyId: record?.allocateAgencyId,
        agencyName: record?.agency?.name,
        agencyStatus: record?.agencyStatusDescription,
        agencyStatusCode: record?.agencyStatus,
        assignedDate: record?.assignedDate ? this.commonService.convertUtcToIst(record?.assignedDate) : '',
        actions: record?.actions,
        /** IIFL Start */
        siteVisitId: record?.customProjectSiteVisitDto?.projectSiteVisitId ? record?.customProjectSiteVisitDto?.projectSiteVisitId : ''
        /** IIFL END */
      };
      return transformedRecord;
    });
    return transformedRecords;
  }

  setAgency(formValue: any) {
    this.agencyData = formValue;
  }

  getAgency() {
    return this.agencyData;
  }

  /**
  * To load the skip agency grid records.
  */
  public skipAgecnyLoad(state: any): Observable<any> {
    const requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.skipAgencyList, { projectId: state?.projectId }) + ProjAuthorizationConstants.agency.skipAgencyList;
    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => this.skipAgencyMapper(response)),
      catchError((error: any) => throwError(() => error))
    );
  }

  /**
 * To get the summary of skip agency grid records.
 */
  public skipAgencyMapper(response: any): GenericTableDataModel<SkipAgencyRow> {
    const data: GenericTableDataModel<any> = {
      records: this.skipRecordsMapper(response?.data || []),
    };
    return data;
  }

  public skipRecordsMapper(records: any[]): SkipAgencyRow[] {
    const transformedRecords: SkipAgencyRow[] = records.map((record: any) => {
      const transformedRecord: SkipAgencyRow = {
        id: record?.skipAgencyId,
        agencyType: record?.agencyType?.name,
        remarks: record?.remarks.toString().length > 96 ? record?.remarks.substr(0, 96) + '...' : record?.remarks,
        actions: record?.actions
      };
      return transformedRecord;
    });
    return transformedRecords;
  }

  /**
   * Will return a list of agency types from the api
   */
  public getAgencyTypes(): Observable<GenericDropdownOption[]> {
    const requestUrl: string = PROJECTS.allocateAgency.agencyTypes + ProjAuthorizationConstants.agency.agencytype;
    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => {
        return this.agencyTypeOptions(response?.data);
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  /**
   * Returns a dropdown array for agency types
    * @param response
   */
  public agencyTypeOptions(response: any): GenericDropdownOption[] {
    return response.map((item: any) => {
      const data: GenericDropdownOption = {
        key: item?.agencyTypeId,
        value: item?.name
      };
      return data;
    });
  }

  /**
   * Will return a list of agency types from the api
   */
  public getProjectDocuments(state: any, agencyDetails: any): Observable<any> {
    let payload: any = this.assignDocumentsPayload(state, agencyDetails);
    const requestUrl: string = PROJECTS.allocateAgency.projectDocuments;
    return this.restApiConnectorService.post(requestUrl, payload).pipe(
      map((response: any) => {
        return response?.data?.content;
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  /**
   * Will return a list of agency names from the api
   */
  public getAgencyNames(projectId: any, id: number): Observable<GenericDropdownOption[]> {
    const requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.agencyNames, { projectId: projectId }) + ProjAuthorizationConstants.agency.agencyNames + `&agencyTypeId=${id}`;
    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => {
        return this.agencyNameOptions(response?.data);
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  /**
   * Returns a dropdown array for agency types
    * @param response
   */
  public agencyNameOptions(response: any): GenericDropdownOption[] {
    return response.map((item: any) => {
      const data: GenericDropdownOption = {
        key: item?.agencyId,
        value: item?.name
      };
      return data;
    });
  }

  public reopenAgency(id: any): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.reopenAgency, { allocateAgencyId: id });
    let reqPayload = this.generateReopenAgencyPayload();
    return this.restApiConnectorService.put(requestUrl, reqPayload);
  }

  /**
   * Call api for deleting agency of specified id.
   * @param id
   * @returns
   */
  public deleteAllocateAgency(id: string): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.viewDeleteAllocateAgency, { allocateAgencyId: id });
    requestUrl = requestUrl + `?projectId=${this.projectsCommonService.projectId}&serviceKey=project/agencyveri&userAction=${this.screenEntitlementCodes.tableActions.deleteAgency}&workflowCode=APF`;
    return this.restApiConnectorService.delete(requestUrl, {});
  }


  /**
  *  To fetch details of particular picked/selected item.
  */
  public viewAgencyReportsDetails(id: any): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.viewAgencyReport, { agencyid: id }) + ProjAuthorizationConstants.agency.viewAgencyReport;
    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => this.viewAgencyReportDetailsDetailMapper(response.data)),
      catchError((error: any) => throwError(() => error))
    );
  }

  // IIFL Start
  /**
  *  To fetch details of particular picked/selected item.
  */
  public previousAgencyReportsDetails(id: any): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.previousAgencyReport, { previousreportId: id }) + ProjAuthorizationConstants.agency.viewAgencyReport;
    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => this.viewAgencyReportDetailsDetailMapper(response.data)),
      catchError((error: any) => throwError(() => error))
    );
  }
  /**
   * To get the grid records in detail.
   */
  public viewAgencyReportDetailsDetailMapper(response: any) {
    const data: any = {
      agency: response?.agency?.name || response?.user?.firstName + ' ' + response?.user?.lastName,
      agencyType: response?.agencyType?.name,
      feedBack: response?.agencyReport.feedBack,
      remarks: response?.agencyReport.remarks,
      uploadDate: this.commonService.convertUtcToIst(response?.agencyReport.uploadDate),
      latitude: response?.customProjectSiteVisitDto?.latitude,
      longitude: response?.customProjectSiteVisitDto?.longitude,
      projectFeedback: response?.customProjectSiteVisitDto?.projectFeedbackReason?.feedbackCategory,
      projectFeedbackReason: response?.customProjectSiteVisitDto?.projectFeedbackReason?.feedbackReason,
      projectRemarks: response?.customProjectSiteVisitDto?.projectFeedbackRemarks,
      builderFeedback: response?.customProjectSiteVisitDto?.builderFeedbackReason?.feedbackCategory,
      builderFeedbackReason: response?.customProjectSiteVisitDto?.builderFeedbackReason?.feedbackReason,
      builderRemarks: response?.customProjectSiteVisitDto?.builderFeedbackRemarks,
      locationFeedback: response?.customProjectSiteVisitDto?.locationFeedbackReason?.feedbackCategory,
      locationFeedbackReason: response?.customProjectSiteVisitDto?.locationFeedbackReason?.feedbackReason,
      locationRemarks: response?.customProjectSiteVisitDto?.locationFeedbackRemarks,
      user: response?.user?.firstName + '' + response?.user?.lastName,
      userRole: response?.user?.userRole?.roleName,
      // IIFL Start
      submittedBy: response?.submittedBy?.firstName+' '+response?.submittedBy?.lastName
      // IIFL End
    };
    return data;
  }
  // IIFL End

  /**
  *  To fetch details of particular picked/selected item.
  */
  public viewAgencyReportsList(id: any): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.viewAgencyReport, { agencyid: id }) + ProjAuthorizationConstants.agency.agencytype;
    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => this.mapArrayRecordForDetail(response.data)),
      catchError((error: any) => throwError(() => error))
    );
  }

  // IIFL Start
  /**
  *  To fetch details of particular picked/selected item.
  */
  public previousReportsList(id: any): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.previousAgencyReport, { previousreportId: id }) + ProjAuthorizationConstants.agency.agencytype;
    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => this.mapArrayRecordForDetail(response.data)),
      catchError((error: any) => throwError(() => error))
    );
  }
  // IIFL End

  /**
   * It takes response as param and set values to defined interface
   * @param response - takes response from data table api
   * @returns - object
   */
  public mapArrayRecordForDetail(response: any): GenericTableDataModel<any> {
    const data: GenericTableDataModel<any> = {
      records: this.viewAgencyReportListDetailMapper(response?.agencyReport),
    };
    return data;
  }
  /**
   * To get the grid records in detail.
   */
  public viewAgencyReportListDetailMapper(response: any) {
    let contentArray: any = [];
    contentArray.push(response);
    const transformedRecords: any = contentArray.map((item: any) => {
      const transformedRecord: any = {
        filename: item?.fileName,
        filetype: item?.filetype,
        filePath: item?.filePath,
        projectDocumentId: item?.projectDocumentId,
        uploadDate: this.commonService.convertUtcToIst(item?.uploadDate),
        fileServiceIdentifier: item?.fileServiceIdentifier
      };
      return transformedRecord;
    });

    return transformedRecords;
  }


  /**
   * Will get skip agency details from the api
   */
  public viewSkipAgency(id: string): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.viewSkipAgency, { skipAgencyId: id }) + ProjAuthorizationConstants.agency.viewSkipAgency;
    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => {
        return response?.data;
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  public initiateDataEntry(reqPayload: any): Observable<any> {
    let requestUrl: string = PROJECTS.allocateAgency.initiateDataEntry;
    return this.restApiConnectorService.post(requestUrl, reqPayload);
  }

  /**
   * Call api for create of allocate agency.
   * @param id
   * @returns
   */
  public allocateAgency(payload: any): Observable<any> {
    let requestUrl: string = PROJECTS.allocateAgency.allocateAgency;
    return this.restApiConnectorService.post(requestUrl, payload);
  }

  /**
   * Call api for create of skip agency.
   * @param id
   * @returns
   */
  public skipAgency(payload: any): Observable<any> {
    let requestUrl: string = PROJECTS.allocateAgency.skipAgency;
    return this.restApiConnectorService.post(requestUrl, payload);
  }

  /**
   * Call api for update of reassign agency.
   * @param id
   * @returns
   */
  public reassignAgency(payload: any, id: any): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.reAssignAgency, { allocateAgencyId: id });
    return this.restApiConnectorService.put(requestUrl, payload);
  }

  public generatePayloadForAssignAgency(formValue: any, mode: any, projectDocuments?: any, workflowProcessCode?: any) {
    return {
      'context': {
        ...ProjAuthorizationConstants.agency.allocateAgencyList,
        workflowRequest: {
          projectId: this.projectsCommonService.projectId,
          workflowCode: 'APF',
          workflowStepCode: this.screenEntitlementCodes.stepCodes.viewAgencyAllocation,
          workflowActionCode: this.screenEntitlementCodes.screenActions.assignAgency
        }
      },
      'payload': {
        'agency': {
          agencyId: formValue?.agencyName?.key,
          name: formValue?.agencyName?.value,
        },
        'project': {
          'projectId': formValue?.projectId
        },
        'agencyStatus': (workflowProcessCode && workflowProcessCode === 'APFSUBSEQUENT') ? 'SUBSEQINPROG' : 'INITIALVERIFICATION',
        'projectDocuments': projectDocuments ? projectDocuments : null
      }
    };
  }

  public generatePayloadForSkipAgency(formValue: any) {
    return {
      'context': {
        'serviceKey': 'project/agencyveri',
        'userAction': this.screenEntitlementCodes.screenActions.skipAgency,
        workflowRequest: {
          projectId: this.projectsCommonService.projectId,
          workflowCode: 'APF',
          workflowStepCode: this.screenEntitlementCodes.stepCodes.viewAgencyAllocation,
          workflowActionCode: this.screenEntitlementCodes.screenActions.skipAgency
        }
      },
      'payload': {
        'agencyType': {
          'agencyTypeId': formValue?.agencyType
        },
        'project': {
          'projectId': formValue.projectId
        },
        'remarks': formValue?.remarks
      }
    };
  }

  public assignDocumentsPayload(doc: any, agencyDetails?: any) {
    const payload =
    {
      context: ProjAuthorizationConstants.projectDocument.search,
      pagination: {
        page: doc?.page || null,
        size: doc?.pageSize || null
      },
      payload: {
        project: {
          projectId: doc?.projectId || null
        },
        documentType: {
          agencyType: {
            agencyTypeId: agencyDetails?.agencyType?.key
          }
        }
      }
    };
    return payload;
  }

  public selectedDocuments(payload: any): Observable<any> {
    let requestUrl: string = PROJECTS.allocateAgency.allocateAgency;
    return this.restApiConnectorService.post(requestUrl, payload);
  }

  public selectedDocumentsForReassign(payload: any, id: any): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.reAssignAgency, { allocateAgencyId: id });
    return this.restApiConnectorService.put(requestUrl, payload);
  }

  public updateSelectedDocuments(payload: any, id: any): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.viewUpdateAssignDocuments, { allocateAgencyId: id });
    return this.restApiConnectorService.put(requestUrl, payload);
  }

  public getUpdateDocumentsList(id: any) {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.viewUpdateAssignDocuments, { allocateAgencyId: id }) + ProjAuthorizationConstants.agency.viewUpdateAssignDocuments;
    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => {
        return response?.data;
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  public generatePayloadForAssignDocuments(projectDocuments: any) {
    return {
      'context': ProjAuthorizationConstants.agency.updateDocument,
      'payload': {
        'projectDocuments': projectDocuments ? projectDocuments : null
      }
    };
  }

  public generatePayloadForAllocateAgency(data: any) {
    //* *IIFL START */
    let userType = sessionStorage.getItem('userType');
    let payload = {};
    if (userType === USER_ROLE[6].userType) {
      payload = {
        project: {
          projectId: data.projectId
        },
        agencyType: {
          agencyTypeId: AGENCY_TYPE[1].agencyTypeId
        },
      };
    } else {
      payload = {
        project: {
          projectId: data.projectId
        }
      };
    }
    //* *IIFL END */
    return {
      context: ProjAuthorizationConstants.agency.allocateAgencyList,
      pagination: {
        page: data?.pageOptions?.['pageNumber'] || null,
        size: data?.pageOptions?.['pageSize'] || null
      },
      payload: payload
    };
  }

  public generateInitiateDataEntryPayload(state: any) {
    return {
      context: {
        serviceKey: ProjAuthCodes.dataentry,
        userAction: this.projectStickyFooterEntitlementCode.initateDataEntry,
        workflowRequest: {
          projectId: this.projectsCommonService.projectId,
          workflowCode: 'APF',
          workflowActionCode: this.projectStickyFooterEntitlementCode.initateDataEntry
        }
      },
      payload: {
        project: {
          projectId: state
        }
      }
    };
  }

  public generateReopenAgencyPayload() {
    return {
      context: ProjAuthorizationConstants.agency.reopenAgency,
      payload: {
        agencyStatus: 'INITIALVERIFICATION'
      }
    };
  }

  public downloadDocument(id: any): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.uploadReport.download, { fileId: id }) + ProjAuthorizationConstants.agency.downloadReport;
    return this.restApiConnectorService
      .get(requestUrl, {}, {}, {}, true, true).pipe(
        map((response: any) => response),
        catchError((error: any) => throwError(() => (error)))
      );
  }

  /**
    *  To fetch details of particular picked/selected item.
    */
  public viewAgencyDownloadDocumentsDetails(id: any): Observable<any> {
    let payload: any = this.downloadDocumentsPayload(id);
    let requestUrl: string = PROJECTS.allocateAgency.viewAgencyDownloadDocuments;
    return this.restApiConnectorService.post(requestUrl, payload).pipe(
      map((response: any) => this.mapArrayRecordForDownloadDocumentsDetails(response.data)),
      catchError((error: any) => throwError(() => error))
    );
  }

  // IIFL Start
  /**
    *  To fetch details of particular picked/selected item.
    */
  public previousDownloadDocumentsDetails(id: any): Observable<any> {
    let payload: any = {
      context: ProjAuthorizationConstants.agency.documentList,
      pagination: {},
      payload: {
        reOpenId: id
      }
    };
    let requestUrl: string = PROJECTS.allocateAgency.previousDownloadDocuments;
    return this.restApiConnectorService.post(requestUrl, payload).pipe(
      map((response: any) => this.mapArrayRecordForDownloadDocumentsDetails(response.data)),
      catchError((error: any) => throwError(() => error))
    );
  }
  // IIFL End

  public mapArrayRecordForDownloadDocumentsDetails(response: any): GenericTableDataModel<any> {
    const data: GenericTableDataModel<any> = {
      records: this.viewAgencyDownloadDocumentsDetailsDetailMapper(response?.content || []),
    };
    return data;
  }

  /**
   * To get the grid records in detail.
   */
  public viewAgencyDownloadDocumentsDetailsDetailMapper(record: any) {
    const transformedRecords: any = record.map((item: any) => {
      const transformedRecord: any = {
        filename: item?.fileName,
        filePath: item?.filePath,
        projectDocumentId: item?.projectDocumentId,
        uploadDate: this.commonService.convertUtcToIst(item?.uploadDate),
        fileServiceIdentifier: item?.fileServiceIdentifier
      };
      return transformedRecord;
    });
    return transformedRecords;
  }
  downloadDocumentsPayload(id: any) {
    const payload = {
      context: ProjAuthorizationConstants.agency.documentList,
      pagination: {},
      payload: {
        allocateAgencyId: id
      }
    };
    return payload;
  }

  /** IIFL START */
  public getUserRole(): Observable<GenericDropdownOption[]> {
    const requestUrl: string = PROJECTS.iiflLegalManager.role;
    const payload = {
      serviceKey: AuthCodes.role,
      userAction: AuthActions.view,
      visibility: 'YES',
      roleId: USER_ROLE[6].roleId
    };
    return this.restApiConnectorService.get(requestUrl, payload).pipe(
      map((response: any) => {
        return this.userRoleOptions(response);
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  /**
   * Returns a dropdown array for user role
    * @param response
   */
  public userRoleOptions(response: any): GenericDropdownOption[] {
    const getData: GenericDropdownOption[] = response?.data?.map(
      (item: any) => {
        const data: GenericDropdownOption = {
          key: item?.roleId,
          value: item?.roleName,
        };
        return data;
      }
    );
    return getData;
  }

  public assignLegalManager(data: any): Observable<any> {
    let payload: any = {
      context: {
        serviceKey: ProjAuthCodes.agencyVerification,
        userAction: this.screenEntitlementCodes.screenActions.assignLegalManager,
        workflowRequest: {
          projectId: this.projectsCommonService.projectId,
          workflowCode: 'APF',
          workflowStepCode: this.screenEntitlementCodes.stepCodes.manageLegalManager,
          workflowActionCode: this.screenEntitlementCodes.screenActions.assignLegalManager
        }
      },
      payload: {
        user: {
          userId: data.userName
        },
        project: {
          projectId: this.projectsCommonService.projectId
        }
      }
    };
    let requestUrl: string = PROJECTS.iiflLegalManager.assignLegalManager;
    return this.restApiConnectorService.post(requestUrl, payload).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  public loadLegalManager(state: TableInputState<GenericAdditionalOptions>): Observable<GenericTableDataModel<LegalManagerRow>> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.iiflLegalManager.legalManagerAssignedList, { projectId: this.projectsCommonService.projectId }) + '?serviceKey=' + ProjAuthCodes.agencyVerification + '&userAction=' + this.screenEntitlementCodes.stepCodes.viewLegalManager;
    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => this.legalManagerMapper(response)),
      catchError((error: any) => throwError(() => error))
    );
  }

  public legalManagerMapper(response: any): GenericTableDataModel<LegalManagerRow> {
    const data: GenericTableDataModel<any> = {
      totalCount: response?.data?.totalElements,
      records: this.legalManagerRecordsMapper(response?.data || []),

    };
    return data;
  }

  public legalManagerRecordsMapper(records: any[]): LegalManagerRow[] {
    const transformedRecords: LegalManagerRow[] = records.map((record: any) => {
      record.assignedDate = moment(record.assignedDate).utc().format();
      const transformedRecord: LegalManagerRow = {
        id: record?.user?.userId,
        username: record?.user?.firstName + ' ' + record?.user?.lastName,
        userRole: record?.user?.userRole?.roleName,
        assignedDateTime: record?.assignedDate ? this.commonService.convertUtcToIst(record?.assignedDate) : '',
        actions: record?.actions,
        allocateAgencyId: record?.allocateAgencyId
      };
      return transformedRecord;
    });
    return transformedRecords;
  }

  public tmLoad(state: TableInputState<GenericAdditionalOptions>): Observable<GenericTableDataModel<TmRow>> {
    let payload = {
      context: {
        serviceKey: ProjAuthCodes.agencyVerification,
        userAction: this.screenEntitlementCodes.stepCodes.viewTechnicalManager
      },
      pagination: {
        page: state?.pageOptions?.['pageNumber'],
        size: state?.pageOptions?.['pageSize']
      },
      payload: {
        project: {
          projectId: this.projectsCommonService.projectId
        }
      }
    };

    let requestUrl: string;
    
    requestUrl = PROJECTS.iiflAllocateAgency.tmAssignedList;

    return this.restApiConnectorService.post(requestUrl, payload).pipe(
      map((response: any) => this.tmMapper(response)),
      catchError((error: any) => throwError(() => error))
    );
  }

  public tmMapper(response: any): GenericTableDataModel<TmRow> {
    const data: GenericTableDataModel<any> = {
      totalCount: response?.data?.totalElements,
      records: this.tmRecordsMapper(response?.data?.content || []),

    };
    return data;
  }

  public tmRecordsMapper(records: any[]): TmRow[] {
    const transformedRecords: TmRow[] = records.map((record: any) => {
      record.assignedDate = moment(record.assignedDate).utc().format();
      const transformedRecord: TmRow = {
        id: record?.user?.userId,
        allocateAgencyId: record?.allocateAgencyId,
        username: record?.user?.firstName + ' ' + record?.user?.lastName,
        userRole: record?.user?.userRole?.roleName,
        roleId: record?.user?.userRole?.roleId,
        status: record?.agencyStatusDescription,
        assignedDateTime: record?.assignedDate ? this.commonService.convertUtcToIst(record?.assignedDate) : '',
        actions: record?.actions
      };
      return transformedRecord;
    });
    return transformedRecords;
  }

  public deleteAssignedLegalManager(id: string): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.iiflLegalManager.deleteAssignedLegalManager, { allocateAgencyId: id });
    requestUrl = requestUrl + `?projectId=${this.projectsCommonService.projectId}&serviceKey=${ProjAuthCodes.agencyVerification}&userAction=${this.screenEntitlementCodes.tableActions.deleteAssignLegalManager}&workflowCode=APF`;
    return this.restApiConnectorService.delete(requestUrl, {});
  }
  public deleteAssignedTm(id: string): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.iiflAllocateAgency.deleteTm, { allocateAgencyId: id });
    requestUrl = requestUrl + `?projectId=${this.projectsCommonService.projectId}&serviceKey=${ProjAuthCodes.agencyVerification}&userAction=${this.screenEntitlementCodes.tableActions.deleteAssignTechnicalManager}&workflowCode=APF`;
    return this.restApiConnectorService.delete(requestUrl, {});
  }

  public userNameList(id: any, roleId: any, value?: any, key?: any): Observable<GenericDropdownOption[]> {
    const requestUrl: string = this.localeFormatterService.format(PROJECTS.iiflAllocateAgency.userName, { projectId: id });
    let reqPayload = {
      context: UsersAuthorizationConstants.users.search,
      pagination: {
        page: 0,
        size: 150
      },
      payload: {
        firstName: value,
        lastName: value,
        userId: value,
        userRole: {
          roleId: roleId
        }
      }
    };

    if (key) {
      delete reqPayload.payload.firstName;
      delete reqPayload.payload.lastName;
    } else {
      delete reqPayload.payload.userId;
    }
    return this.restApiConnectorService.post(requestUrl, reqPayload).pipe(
      map((response: any) => this.tmNameOptions(response)),
      catchError((error: any) => throwError(() => error))
    );
  }

  /**
   * Returns a dropdown array for user role
    * @param response
   */
  public tmNameOptions(response: any): GenericDropdownOption[] {
    const getData: GenericDropdownOption[] = response?.data?.content?.map(
      (item: any) => {
        const data: GenericDropdownOption = {
          key: item?.userId,
          value: item?.firstName + ' ' + item?.lastName,
        };
        return data;
      }
    );
    return getData;
  }
  public getskipAgencyTypes(): Observable<GenericDropdownOption[]> {
    const requestUrl: string = this.localeFormatterService.format(PROJECTS.iiflSkipAgency.skipAgencyTypeList, { projectId: this.projectsCommonService.projectId }) + ProjAuthorizationConstants.agency.agencytype;
    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => {
        return this.getskipAgencyTypesOptions(response);
      }),
      catchError((error: any) => throwError(() => error))
    );
  }

  /**
   * Returns a dropdown array for user role
    * @param response
   */
  public getskipAgencyTypesOptions(response: any): GenericDropdownOption[] {
    const getData: GenericDropdownOption[] = response?.data?.map(
      (item: any) => {
        const data: GenericDropdownOption = {
          key: item?.agencyTypeId,
          value: item?.name,
        };
        return data;
      }
    );
    return getData;
  }

  public assignTm(data: any) {
    let payload: any = {
      context: {
        serviceKey: ProjAuthCodes.agencyVerification,
        userAction: this.screenEntitlementCodes.screenActions.assignTechnicalManager,
        workflowRequest: {
          projectId: this.projectsCommonService.projectId,
          workflowCode: 'APF',
          workflowStepCode: this.screenEntitlementCodes.stepCodes.viewAgencyAllocation,
          workflowActionCode: this.screenEntitlementCodes.screenActions.assignTechnicalManager
        }
      },
      payload: {
        user: {
          userId: data.username
        },
        project: {
          projectId: this.projectsCommonService.projectId
        },
        agencyStatus: 'INITIALVERIFICATION'
      }
    };
    let requestUrl: string = PROJECTS.iiflAllocateAgency.assignTm;
    return this.restApiConnectorService.post(requestUrl, payload).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  public reAssignTm(data: any, id: any) {
    let payload: any = {
      context: {
        serviceKey: ProjAuthCodes.agencyVerification,
        userAction: this.screenEntitlementCodes.tableActions.reAssignTechnicalManager,
        workflowRequest: {
          projectId: this.projectsCommonService.projectId,
          workflowCode: 'APF',
          workflowStepCode: this.screenEntitlementCodes.stepCodes.viewAgencyAllocation,
          workflowActionCode: this.screenEntitlementCodes.tableActions.reAssignTechnicalManager
        }
      },
      payload: {
        user: {
          userId: data.username
        },
        project: {
          projectId: this.projectsCommonService.projectId
        },
        agencyStatus: 'INITIALVERIFICATION'
      }
    };
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.iiflAllocateAgency.reAssignTm, { allocateAgencyId: id });
    return this.restApiConnectorService.put(requestUrl, payload).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  public reAssignLegalManager(data: any, allocationId: any) {
    let payload: any = {
      context: {
        serviceKey: ProjAuthCodes.agencyVerification,
        userAction: this.screenEntitlementCodes.tableActions.reAssignLegalManager,
        workflowRequest: {
          projectId: this.projectsCommonService.projectId,
          workflowCode: 'APF',
          workflowStepCode: this.screenEntitlementCodes.stepCodes.manageLegalManager,
          workflowActionCode: this.screenEntitlementCodes.tableActions.reAssignLegalManager
        }
      },
      payload: {
        user: {
          userId: data.userName
        },
        project: {
          projectId: this.projectsCommonService.projectId
        }
      }
    };
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.iiflLegalManager.reAssignLegalManager, { allocateAgencyId: allocationId });
    return this.restApiConnectorService.put(requestUrl, payload).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  /**
  *  To fetch details of particular picked/selected item.
  */
  public viewSiteVisitPhotographsList(id: any): Observable<any> {
    let requestUrl: string = this.localeFormatterService.format(PROJECTS.allocateAgency.viewAgencyReport, { agencyid: id }) + ProjAuthorizationConstants.agency.agencytype;
    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => this.mapArrayRecordForSiteVisitPhotographs(response.data)),
      catchError((error: any) => throwError(() => error))
    );
  }

  /**
   * It takes response as param and set values to defined interface
   * @param response - takes response from data table api
   * @returns - object
   */
  public mapArrayRecordForSiteVisitPhotographs(response: any): GenericTableDataModel<any> {
    const data: GenericTableDataModel<any> = {
      records: this.viewSiteVisitPhotographsMapper(response?.photographList),
    };
    return data;
  }

  /**
   * To get the grid records in detail.
   */
  public viewSiteVisitPhotographsMapper(response: any) {
    let contentArray: any = [];
    contentArray.push(response);
    const transformedRecords: any = contentArray.map((item: any) => {
      const transformedRecord: any = {
        filename: item?.fileName,
        filetype: item?.filetype,
        filePath: item?.filePath,
        // projectDocumentId: item?.projectDocumentId,
        uploadDate: this.commonService.convertUtcToIst(item?.uploadDate),
        // fileServiceIdentifier: item?.fileServiceIdentifier
      };
      return transformedRecord;
    });

    return transformedRecords;
  }

  public getUserRolesList(): Observable<GenericDropdownOption[]> {
    let requestUrl: string;

    if (this.applicationEntitlementsService.projectEntitlement?.workflowProcessCode === 'APFSUBSEQUENT') {
      requestUrl = PROJECTS.iiflAllocateAgency.userRoles + '?isPrePostPseudoRole=NO' + '&serviceKey=' + AuthCodes.user + '&userAction=' + AuthActions.view;
    } else {
      requestUrl = PROJECTS.iiflAllocateAgency.userRoles + '?isPrePostPseudoRole=YES' + '&serviceKey=' + AuthCodes.user + '&userAction=' + AuthActions.view;
    }

    return this.restApiConnectorService.get(requestUrl).pipe(
      map((response: any) => {
        return this.userRoleOptions(response);
      }),
      catchError((error: any) => throwError(() => error))
    );
  }
  /** IIFL END */

}

