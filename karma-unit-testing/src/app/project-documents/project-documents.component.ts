import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, map, shareReplay } from 'rxjs';
import { CommonBase } from 'src/app/commons/classes/common-base/common-base';
import { CommonTableConfig, CommonTableHook } from 'src/app/shared/shared-table/interfaces/common-table-config';
import { ProjectDocumentUploadRow } from '../../interfaces/project-info-interface';
import { ProjectsBaseInformationService } from '../../services/projects-base-information/projects-base-information.service';
import { GenericTableDataModel } from 'src/app/shared/shared-table/models/common-table.model';
import { ProjectsCommonService } from '../../../project-commons/services/projects-common/projects-common.service';
import { DASHBOARD_ROUTER_LINKS, PROJECT_UPLOAD_DOCUMENTS_ROUTER_LINKS } from 'src/app/commons/enums/router-links';
import { DeleteMsg } from 'src/app/commons/interfaces/delete-options';
import { ProjectDocumentConfig } from 'iifl-primesquare-base-ui-configs';
import { TableInputState, GenericAdditionalOptions } from 'src/app/shared/shared-table/interfaces/common-table-state';
import { CommonTablePageState } from 'src/app/shared/shared-table/interfaces/common-table-page-state';
import { ApplicationEntitlementsService } from 'src/app/core-services/entitlemets/application-entitlements/application-entitlements.service';
import { ProjectInformationEntitlementCodes } from 'src/app/core-services/constants/application-entitlements/application-entitlements.constants';
import { ScrollPositionService } from 'src/app/core-services/services/scroll-position/scroll-position.service';
import { CommonService } from 'src/app/commons/services/common.service';
import { userRoles } from 'src/app/authentication/constants/userRoles.constants';
import { SEARCHABLE_TEXT_MAX_LENGTH } from 'src/app/commons/const/searchable-text-length';

@Component({
  selector: 'ss-project-documents',
  templateUrl: './project-documents.component.html',
  styleUrls: ['./project-documents.component.scss']
})
export class ProjectDocumentsComponent extends CommonBase {

  @ViewChild('documentFileUpload')
  public documentFileUpload!: ElementRef;
  public searchableMaxLength: number = SEARCHABLE_TEXT_MAX_LENGTH;
  public projectDocumentform: FormGroup = new FormGroup({});
  public fileName: string = '';
  public fileBlob: any;
  public documentFileName: string = '';
  public projectId: any = '';
  public fileObj: any;
  public documentList: any = [];
  public documentTypeArray: any = [];
  public documentTypeArrayOptions: any = [];
  isHandset$: Observable<boolean>;
  public fileId: any = '';
  public fileEdited: boolean = false;
  public isShowSpinner: boolean = false;
  public isSaveButtonDisabled:boolean;
  public tableHook: CommonTableHook<ProjectDocumentUploadRow> = {
    onLoad: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onLoad(state);
    },
    onRefresh: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onPaginate(state);
    },
    onPaginate: (
      pageState: CommonTablePageState,
      state: TableInputState<GenericAdditionalOptions>
    ) => {
      this.scrollService.scrollToTop();
      return this.onPaginate(state);
    },
  };
  public tableConfig: CommonTableConfig;
  public projectDocumentRouterLinks = PROJECT_UPLOAD_DOCUMENTS_ROUTER_LINKS;
  public dashboardRouterLinks = DASHBOARD_ROUTER_LINKS;
  public projectDocumentId: any = '';
  public editDocument: boolean = false;
  public showProjectDocumentForm: boolean = false;
  public screenEntitlementCodes: any = ProjectInformationEntitlementCodes;
  public screenMode: any;
  public fileExtension: string = '';
  public notificationPin: boolean = false;
  
  // IIFL Start
  public docList: any = [];
  public showDocList: boolean = false;
  // IIFL End

  constructor(private breakpointsObserver: BreakpointObserver,
    private fb: FormBuilder,
    _injector: Injector,
    public projectsBaseInformationService: ProjectsBaseInformationService,
    public projectsCommonService: ProjectsCommonService, public projectDocumentConfig: ProjectDocumentConfig, public commonService: CommonService,
    public applicationEntitlementsService: ApplicationEntitlementsService, private scrollService: ScrollPositionService) {
    super(_injector);
    this.isSaveButtonDisabled = false;
    this.isHandset$ = breakpointsObserver
      .observe(Breakpoints.HandsetPortrait)
      .pipe(
        map((result) => result.matches),
        shareReplay()
      );
    this.projectId = this.projectsCommonService.projectId;
    this.tableConfig = {
      isPageable: true,
      isSortable: false,
      pageSizeOptions: [10],
      pageOptions: {
        pageNumber: 0,
        pageSize: 10,
      },
      tableColumns: this.projectDocumentConfig.projectDocumentTableConfig,
      refresh: () => { },
    };

    this.projectDocumentform = this.fb.group({
      documentType: [null, [Validators.required]],
      documentTypeSearchTxt: [],
      fromWhom: [null],
      inFavorOf: [null],
      remarks: [null],
      documentName: [null, [Validators.required]]
    });
    this.projectDocumentform.get('documentTypeSearchTxt')?.valueChanges.subscribe(txt => {
      this.documentTypeArrayOptions = this.commonService.filterData(txt, this.documentTypeArray, 'documentType', this.projectDocumentform);
    });
    this.documentTypeList();
    this.getDocumentsList();
  }

  public checkScreenMode() {
    this.screenMode = this.applicationEntitlementsService.getEditableStepCodesEntitlementMode(ProjectInformationEntitlementCodes.stepCodes.createEditUploadDocument);
    if (this.screenMode === 'VIEW') {
      this.showProjectDocumentForm = false;
      return this.showProjectDocumentForm;
    } else {
      // IIFL Start
      // IF condition changed for IIFL
      if (sessionStorage.getItem('userType') === userRoles.agency || sessionStorage.getItem('userType') === userRoles.legalManager || (this.applicationEntitlementsService.projectEntitlement?.addlParams && this.applicationEntitlementsService.projectEntitlement?.addlParams?.isPseudoAgencyLogin === 'Yes')) {
      // IIFL End
        this.showProjectDocumentForm = false;
        return this.showProjectDocumentForm;
      } else {
        this.showProjectDocumentForm = true;
        return this.showProjectDocumentForm;
      }
    }
  }

  public onDocumentFileSelected(event: any) {
    this.notificationPin = true;
    this.fileEdited = true;
    this.fileObj = event[0];
    this.fileExtension = this.fileObj?.name?.split('.').pop();
    if (this.fileObj) {
      this.documentFileName = this.fileObj.name;
      this.projectDocumentform.patchValue({
        documentName: this.fileObj.name
      });
      this.projectDocumentform.get('documentName')?.disable();
      this.checkFileValidation(this.fileObj);
      this.documentFileUpload.nativeElement.value = '';
    }
  }

  public checkFileValidation(file: any) {
    const fileSize = file.size;
    const fileMb = fileSize / 1024 ** 2;
    if (fileMb > 2) {
      this.notificationId = 'ss-upload-document-error';
    } else {
      this.notificationId = '';
    }
  }

  public uploadDocument() {
    this.isSaveButtonDisabled = true;
    if (this.fileExtension === 'xls' || this.fileExtension === 'xlsx' || this.fileExtension === 'pdf' || this.fileExtension === 'doc' || this.fileExtension === 'docx') {
      let formValue = this.projectDocumentform.getRawValue();
      let documentType = this.documentTypeArray.find((item: any) => item.key === formValue.documentType);
      let data = {
        fromWhom: formValue?.fromWhom,
        inFavorOf: formValue?.inFavorOf,
        documentType: {
          name: documentType?.value,
          documentTypeId: documentType?.key
        },
        fileName: this.documentFileName,
        remarks: formValue?.remarks
      };

      const fileServiceRequest: any = {
        projectId: this.projectId,
        screenCode: this.screenEntitlementCodes.stepCodes.createEditUploadDocument,
        formData: JSON.stringify(data),
        workflowCode: 'APF',
        workflowStepCode: this.screenEntitlementCodes.stepCodes.createEditUploadDocument,
        workflowActionCode: this.screenEntitlementCodes.screenActions.saveProjectDocument,
      };

      let formData = new FormData();
      formData.append('file', this.fileObj, this.documentFileName);
      formData.append('fileServiceRequest', JSON.stringify(fileServiceRequest));

      this.projectsBaseInformationService.uploadDocument(formData).subscribe(
        {
          next: (response: any) => {
            this.isSaveButtonDisabled = false;
            if (response?.status === 422) {
              this.notificationId = 'ss-upload-document-success';
              this.handleErrorResponse(response?.valErrors[0]);
            } else {
              this.applicationEntitlementsService.updateProjectEntitlements(response?.metaData);
              this.tableConfig.refresh();
              this.notificationId = 'ss-upload-document-success';
              if (response.code === 'ps.fileservice.upload.successful') {
                response.code = 'ps.fileservice.upload.document.successful';
              }
              this.handleSuccessResponse(response);
              this.fileExtension = '';
              this.projectDocumentform.reset();
              this.fileObj = null;
              this.documentFileName = '';
              this.notificationPin = false;
            }
            this.isShowSpinner = false;
          },
          error: (error: any) => {
            this.isSaveButtonDisabled = false;
            if (error?.status === 422) {
              this.notificationId = 'ss-upload-document-success';
              this.handleErrorResponse(error?.error?.valErrors[0]);
            } else {
              this.notificationId = 'ss-upload-document-success';
              this.handleErrorResponse(error?.error);
            }
            this.isShowSpinner = false;
          }
        }
      );
    } else {
      this.notificationId = 'ss-upload-document-success';
      let error = {
        'field': 'file',
        'message': 'Unsupported file format - Please select a file with extension .pdf, .doc, .docx, .xls, .xlsx',
        'code': 'ps.fileservice.file.format.not.allowed'
      };
      this.handleErrorResponse(error);
      this.isShowSpinner = false;
    }
  }

  /**
  * On load returns observable of table data
  * @returns - observable
  */
  public onLoad(state: TableInputState<GenericAdditionalOptions>): Observable<GenericTableDataModel<ProjectDocumentUploadRow>> {
    return this.projectsBaseInformationService.loadDocumentList(this.projectId, state);
  }

  /**
   * On pagination returns observable of table data with considering searched item and specific set of pagination
   * @param state - search param
   * @returns - observable
   */
  public onPaginate(
    state: TableInputState<GenericAdditionalOptions>
  ): Observable<GenericTableDataModel<ProjectDocumentUploadRow>> {

    return this.projectsBaseInformationService.loadDocumentList(this.projectId, state);
  }

  public downloadDocument(documentId: any, fileName: any) {
    this.projectsBaseInformationService.downloadDocument(documentId).subscribe(
      {
        next: (response: any) => {

          const url = window.URL.createObjectURL(response);
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.href = url;
          a.download = fileName;
          a.click();

        },
        error: (error: any) => {
          if (error?.status === 422) {
            this.notificationId = 'ss-upload-document-success';
            this.handleErrorResponse(error?.error?.valErrors[0]);
          } else {
            this.notificationId = 'ss-upload-document-success';
            this.handleErrorResponse(error?.error);

          }

        }
      }
    );
  }

  public documentTypeList() {
    this.projectsBaseInformationService.documentTypeList().subscribe(
      {
        next: (response: any) => {
          this.documentTypeArray = response;
          this.documentTypeArrayOptions = response;
        },
        error: (error: any) => {
          this.documentTypeArrayOptions = [];
        }
      }
    );
  }

  /**
   * To open dialog for delete action
   * @param stateName - pass state name for following action
   */
  public openDeleteDialog(item: any): void {
    const warningData: DeleteMsg = {
      headerBody: {
        params: {
          name: item?.fileName,
        }
      },
      headerText: ''
    };

    this.showDeleteWarning(warningData)
      .afterClosed()
      .subscribe((result: any) => {
        this.cancelEdit();
        if (result) {
          this.delete(item?.id);
        }
      });
  }

  /**
   * on delete it will call api wit specific id 
   * @param id 
   * @param state 
   */
  public delete(id?: any): void {

    this.projectsBaseInformationService.deleteDocument(id).subscribe(
      {
        next: (response: any) => {
          this.notificationId = 'ss-upload-document-success';
          this.applicationEntitlementsService.updateProjectEntitlements(response?.metaData);
          this.handleSuccessResponse(response);
          this.tableConfig.refresh();
        },
        error: (error: any) => {
          if (error?.error?.status === 422) {
            let responseMsg = {
              code: 'ss-allocateAgency-projectDocuments-delete-notallowed',
              responseMessage: this.getLocaleString('project-document-upload-list.deleteAgencyMsge')
            };
            this.notificationId = 'ss-allocateAgency-projectDocuments-delete-notallowed';
            this.handleErrorResponse(responseMsg);
          } else {
            this.notificationId = 'ss-upload-document-success';
            this.handleErrorResponse(error.error);
          }
        }
      }
    );

  }


  /**
   * It patches values to form while in edit mode
   * @param details response from view api is passed
   */
  public patchFormValue(details?: any) {
    this.editDocument = true;
    this.projectDocumentform.patchValue({

      documentName: details?.fileName,
      documentType: details?.documentTypeId,

      fromWhom: details?.fromWhom,
      inFavorOf: details?.inFavorOf,
      remarks: details?.remarks

    });
    this.fileExtension = details?.fileName?.split('.').pop();
    this.fileId = details.fileId;
    this.documentFileName = details?.fileName;
    this.projectDocumentId = details?.id;
    this.scrollService.scrollToTop();
  }

  public saveDocument() {
    this.isShowSpinner = true;
    if (this.fileId === '') {
      this.uploadDocument();
    } else {
      this.editUploadDocument();
    }
  }

  public editUploadDocument() {
    this.isSaveButtonDisabled = true;
    if (this.fileExtension === 'xls' || this.fileExtension === 'xlsx' || this.fileExtension === 'pdf' || this.fileExtension === 'doc' || this.fileExtension === 'docx') {
      let formValue = this.projectDocumentform.getRawValue();
      let documentType = this.documentTypeArray.find((item: any) => item.key === formValue.documentType);
      let data = {
        fromWhom: formValue?.fromWhom,
        inFavorOf: formValue?.inFavorOf,
        documentType: {
          name: documentType?.value,
          documentTypeId: documentType?.key
        },
        fileName: this.documentFileName,
        remarks: formValue?.remarks,
        projectDocumentId: this.projectDocumentId
      };

      const fileServiceRequest: any = {
        fileId: this.fileId,
        projectId: this.projectId,
        screenCode: this.screenEntitlementCodes.stepCodes.createEditUploadDocument,
        formData: JSON.stringify(data),
        workflowCode: 'APF',
        workflowStepCode: this.screenEntitlementCodes.stepCodes.createEditUploadDocument,
        workflowActionCode: this.screenEntitlementCodes.screenActions.saveProjectDocument,
      };

      let formData = new FormData();
      if (this.fileObj) {

        formData.append('file', this.fileObj, this.documentFileName);
      }
      formData.append('fileServiceRequest', JSON.stringify(fileServiceRequest));

      this.projectsBaseInformationService.editUploadDocument(formData).subscribe(
        {
          next: (response: any) => {
            this.isSaveButtonDisabled = false;
            if (response?.status === 422) {
              this.notificationId = this.componentId;
              this.handleErrorResponse(response?.valErrors[0]);
            } else {
              this.applicationEntitlementsService.updateProjectEntitlements(response?.metaData);
              this.notificationId = 'ss-upload-document-success';
              if (response.code === 'ps.fileservice.upload.successful') {
                response.code = 'ps.fileservice.edit.document.successful';
              }
              this.fileExtension = '';
              this.tableConfig.refresh();
              this.handleSuccessResponse(response);
              this.projectDocumentform.reset();
              this.fileObj = null;
              this.documentFileName = '';
              this.fileId = '';
              this.projectDocumentId = '';
              this.editDocument = false;
              this.notificationPin = false;
            }
            this.isShowSpinner = false;
          },
          error: (error: any) => {
            this.isSaveButtonDisabled = false;
            if (error?.status === 422) {
              this.notificationId = 'ss-upload-document-success';
              this.handleErrorResponse(error?.error?.valErrors[0]);
            } else {
              this.notificationId = 'ss-upload-document-success';
              this.handleErrorResponse(error.error);

            }
            this.isShowSpinner = false;
          }
        }
      );
    } else {
      this.notificationId = 'ss-upload-document-success';
      let error = {
        'field': 'file',
        'message': 'Unsupported file format - Please select a file with extension .pdf, .doc, .docx, .xls, .xlsx',
        'code': 'ps.fileservice.file.format.not.allowed'
      };
      this.handleErrorResponse(error);
      this.isShowSpinner = false;
    }
  }

  public cancelEdit() {
    this.tableConfig.refresh();
    this.projectDocumentform.reset();
    this.fileObj = null;
    this.documentFileName = '';
    this.fileId = '';
    this.projectDocumentId = '';
    this.editDocument = false;
    this.fileEdited = false;
    this.fileExtension = '';
  }


  checkTableActionEntitlement(actionCode: any, tableActions: any) {
    if (this.applicationEntitlementsService.checkTableActionEntitlement(actionCode, tableActions, this.screenMode) === true) {
      return true;
    } else {
      return false;
    }
  }

  public checkFormDisability() {
    if (this.projectDocumentform.dirty || this.fileEdited) {
      if (this.notificationId === 'ss-upload-document-error') {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  // IIFL code start
  public showDocumentsList() {
    this.showDocList = true;
  }

  public hideDocumentsList() {
    this.showDocList = false;
  }

  private getDocumentsList() {
    this.projectsBaseInformationService.getDocumentsList().subscribe(
      {
        next: (response: any) => {
          this.docList = response?.data;
        },
        error: (error: any) => {
          this.docList = [];
        }
      }
    );
  }
  // IIFL code end
}
