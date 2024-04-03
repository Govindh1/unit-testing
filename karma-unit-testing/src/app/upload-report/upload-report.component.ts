import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonBase } from 'src/app/commons/classes/common-base/common-base';
import { ALLOCATE_AGENCY_ROUTER_LINKS} from 'src/app/commons/enums/router-links';
import { UploadReportService } from '../../services/upload-report.service';
import { DeleteMsg } from 'src/app/commons/interfaces/delete-options';
import { ProjectsCommonService } from '../../../project-commons/services/projects-common/projects-common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonTableConfig, CommonTableHook } from 'src/app/shared/shared-table/interfaces/common-table-config';
import { CommonTablePageState } from 'src/app/shared/shared-table/interfaces/common-table-page-state';
import { TableInputState, GenericAdditionalOptions } from 'src/app/shared/shared-table/interfaces/common-table-state';
import { GenericTableDataModel } from 'src/app/shared/shared-table/models/common-table.model';
import { ProjectDocumentUploadRow } from '../../../project-info/interfaces/project-info-interface';
import { UpdateReportConfig } from 'iifl-primesquare-base-ui-configs';
import { AgencyVerificationEntitlementCodes } from 'src/app/core-services/constants/application-entitlements/application-entitlements.constants';
import { ApplicationEntitlementsService } from 'src/app/core-services/entitlemets/application-entitlements/application-entitlements.service';
import { CommonService } from 'src/app/commons/services/common.service';

@Component({
  selector: 'ss-upload-report',
  templateUrl: './upload-report.component.html',
  styleUrls: ['./upload-report.component.scss']
})
export class UploadReportComponent extends CommonBase {

  @ViewChild('fileUpload') fileUpload!: ElementRef;
  @ViewChild('documentFileUpload') documentFileUpload!: ElementRef;

  public allocateAgencyRouterLinks: typeof ALLOCATE_AGENCY_ROUTER_LINKS =
    ALLOCATE_AGENCY_ROUTER_LINKS;
  public screenEntitlementCodes = AgencyVerificationEntitlementCodes;
  form: FormGroup = new FormGroup({});
  fileBlob: any;
  reportsDataSource: any = [];
  documentsDataSource: any = [];
  public documentFileName: string = '';
  public reportFileName: string = '';
  public reportInfo: boolean = false;
  public docInfo: boolean = false;
  public allocatedAgencyId: string = '';
  public fileObj: any;
  public projectId = '';
  public reportProjectId: any = 0;
  public fileId: any;
  public isDocFileExceed = false;
  public isReportFileExceed = false;
  public docFileExtension: string = '';
  public reportFileExtension: string = '';
  public agencyDetails: any;
  // IIFL START
  public userDetails: any;
  // IIFL END
  public isShowSpinner: boolean = false;
  public isAgencyReportShowSpinner: boolean = false;
  public isSaveButtonDisabled:boolean;
  public docTableConfig: CommonTableConfig;
  public reportTableConfig: CommonTableConfig;
  public tableHook: CommonTableHook<ProjectDocumentUploadRow> = {
    onLoad: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onLoad(state);
    },
    onRefresh: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onLoad(state);
    },
    onPaginate: (
      pageState: CommonTablePageState,
      state: TableInputState<GenericAdditionalOptions>
    ) => {
      return this.onLoad(state);
    },
  };

  public reportTableHook: CommonTableHook<ProjectDocumentUploadRow> = {
    onLoad: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onReportsLoad(state);
    },
    onRefresh: (state: TableInputState<GenericAdditionalOptions>) => {
      return this.onReportsLoad(state);
    }
  };

  public properyPhotograpFileFormats = '.jpg, .jpeg, .png, .tiff, .pdf, .doc, .docx';

  constructor(
    private fb: FormBuilder,
    _injector: Injector,
    public uploadReportService: UploadReportService,
    public projectCommonService: ProjectsCommonService,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    private updateReportConfig: UpdateReportConfig,
    private applicationEntitlementsService: ApplicationEntitlementsService,
    public commonService: CommonService
  ) {
    super(_injector);
    this.isSaveButtonDisabled = false;
    this.projectId = this.projectCommonService.projectId;

    this.agencyDetails = this.uploadReportService.agencyData;
    // IIFL START
    this.userDetails = this.uploadReportService.assignedTechnicalManagerData;
    // IIFL END
    if (this.agencyDetails?.agencyName) {
      this.agencyDetails['agencyName'] = this.agencyDetails?.agencyName.length > 32
        ? `${this.agencyDetails?.agencyName.substr(0, 32)}...`
        : this.agencyDetails?.agencyName;
    }

    this.getAllocatedAgencyId();
    

    this.form = this.fb.group({
      feedback: [null, [Validators.required]],
      remarks: [null, [Validators.required]],
      reportName: [null],
      documentName: [null]
    });

    this.docTableConfig = {
      isPageable: true,
      isSortable: false,
      pageSizeOptions: [5],
      pageOptions: {
        pageNumber: 0,
        pageSize: 5,
      },
      tableColumns: this.updateReportConfig.documentTablesConfig,
      refresh: () => { },
    };

    this.reportTableConfig = {
      isPageable: false,
      isSortable: false,
      pageSizeOptions: [5],
      pageOptions: {
        pageNumber: 0,
        pageSize: 5,
      },
      tableColumns: this.updateReportConfig.documentTablesConfig,
      refresh: () => { },
    };
    this.getDocumentsList();
    this.getReportsList();
  }

  public getAllocatedAgencyId() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.allocatedAgencyId = params['id'] || '';
    });
  }

  /**
  * On load returns observable of table data
  * @returns - observable
  */
  public onLoad(state: TableInputState<GenericAdditionalOptions>): Observable<GenericTableDataModel<any>> {
    return this.uploadReportService.loadDocumentList(this.allocatedAgencyId, state);
  }

  /**
   * On pagination returns observable of table data with considering searched item and specific set of pagination
   * @param state - search param
   * @returns - observable
   */
  public onPaginate(
    state: TableInputState<GenericAdditionalOptions>
  ): Observable<GenericTableDataModel<any>> {
    return this.uploadReportService.loadDocumentList(this.allocatedAgencyId, state);
  }

  getDocumentsList() {
    this.uploadReportService.loadDocumentList(this.allocatedAgencyId, {}).subscribe(
      {
        next: (response: any) => {
          this.documentsDataSource = response.records;
        },
        error: (error: any) => {
          this.documentsDataSource = [];
        }
      }
    );
  }

  /**
 * On load returns observable of table data
 * @returns - observable
 */
  public onReportsLoad(state: TableInputState<GenericAdditionalOptions>): Observable<GenericTableDataModel<any>> {
    return this.uploadReportService.loadReportList(this.allocatedAgencyId, state);
  }

  getReportsList() {
    this.uploadReportService.loadReportList(this.allocatedAgencyId, {}).subscribe(
      {
        next: (response: any) => {
          this.reportsDataSource = response?.records;
          this.reportProjectId = response?.records[0]?.id;
          this.fileId = response?.records[0]?.fileId;
          this.form.patchValue({
            feedback: response?.records[0]?.feedback,
            remarks: response?.records[0]?.remarks
          });
        },
        error: (error: any) => {
          this.reportsDataSource = [];
          this.reportProjectId = 0;
          this.fileId = null;
        }
      }


    );
  }

  public onDocFileSelected(event: any) {
    this.fileObj = event[0];
    this.docFileExtension = this.fileObj?.name?.split('.').pop();
    if (this.fileObj) {
      this.documentFileName = this.fileObj.name;
      this.form.patchValue({
        documentName: this.fileObj.name
      });
      this.form.get('documentName')?.disable();
      this.documentFileValidation(this.fileObj);
      this.documentFileUpload.nativeElement.value = '';
    }
  }

  public documentFileValidation(file: any) {
    const fileSize = file.size;
    const fileMb = fileSize / 1024 ** 2;
    if (fileMb > 2) {
      this.isDocFileExceed = true;
    } else {
      this.isDocFileExceed = false;
    }
  }

  public reportFileValidation(file: any) {
    const fileSize = file.size;
    const fileMb = fileSize / 1024 ** 2;
    if (fileMb > 2) {
      this.isReportFileExceed = true;
    } else {
      this.isReportFileExceed = false;
    }
  }

  onReportFileSelected(event: any) {
    this.fileObj = event[0];
    this.reportFileExtension = this.fileObj?.name?.split('.').pop();
    if (this.fileObj) {
      this.reportFileName = this.fileObj.name;
      this.form.patchValue({
        reportName: this.fileObj.name
      });
      this.form.get('reportName')?.disable();
      this.reportFileValidation(this.fileObj);
      this.fileUpload.nativeElement.value = '';
    }
  }

  uploadReport() {
    this.isSaveButtonDisabled = true;
    if (this.reportFileExtension === 'xls' || this.reportFileExtension === 'xlsx' || this.reportFileExtension === 'pdf' || this.reportFileExtension === 'doc' || this.reportFileExtension === 'docx') {
      this.isAgencyReportShowSpinner = true;
      let formValue = this.form.getRawValue();
      let data = {

        agencyReport: {
          fileName: this.reportFileName,
          feedBack: formValue?.feedback,
          remarks: formValue?.remarks,
          projectDocumentId: this.reportProjectId,
        },
        allocateAgencyId: this.allocatedAgencyId,
        documentType: 'REPORT'
      };

      const fileServiceRequest: any = {
        projectId: this.projectId,
        formData: JSON.stringify(data),
        screenCode: this.screenEntitlementCodes.stepCodes.viewAgencyUpdateReport,
        workflowCode: 'APF',
        workflowStepCode: this.screenEntitlementCodes.stepCodes.viewAgencyUpdateReport,
        workflowActionCode: this.screenEntitlementCodes.screenActions.uploadReport,
        entityId: this.agencyDetails?.agencyId,
        entityName: this.reportFileName
      };

      let formData = new FormData();
      if (this.fileObj) {
        formData.append('file', this.fileObj, this.reportFileName);
      }

      formData.append('fileServiceRequest', JSON.stringify(fileServiceRequest));

      this.uploadReportService.uploadReport(formData).subscribe(
        {
          next: (response: any) => {
            this.isSaveButtonDisabled = false;
            if (response?.status === 422) {
              this.notificationId = 'ss-document-upload-error';
              this.handleErrorResponse(response?.valErrors[0]);
            } else {
              this.form.get('reportName')?.enable();
              this.reportFileName = '';
              this.reportFileExtension = '';
              this.notificationId = 'ss-report-upload-success';
              if (this.applicationEntitlementsService.projectEntitlement?.workflowProcessCode === 'APFSUBSEQUENT') {
                response.code = 'ps.subsequent.report.upload.successful';
              } else {
                response.code = 'ps.report.upload.successful';
              }
	      // IIFL START
              // for iifl Check if addlParams is null for sudo agency/user
              // IIFL Start
              const metaData = response?.metaData;
              if (this.applicationEntitlementsService?.projectEntitlement?.addlParams?.isPseudoAgencyLogin === 'Yes') {
                metaData.addlParams = {isPseudoAgencyLogin: 'Yes'};
                this.handleSuccessResponse(response);
                this.cancel();
                this.applicationEntitlementsService.setEntitlementEvent();
                this.form.get('reportName')?.reset();
                this.form.get('reportName')?.updateValueAndValidity();
              }
	      // IIFL END
              else {
                this.applicationEntitlementsService.updateProjectEntitlements(response?.metaData);
                this.handleSuccessResponse(response);
                this.cancel();
                this.applicationEntitlementsService.setEntitlementEvent();
                this.form.get('reportName')?.reset();
                this.form.get('reportName')?.updateValueAndValidity();
              }
            }
            this.isAgencyReportShowSpinner = false;
          },
          error: (error: any) => {
            this.isSaveButtonDisabled = false;
            if (error?.error?.status === 422) {
              this.notificationId = 'ss-document-upload-error';
              this.handleErrorResponse(error?.error?.valErrors[0]);
            } else {
              this.notificationId = this.componentId;
              this.handleErrorResponse(error);
            }
            this.isAgencyReportShowSpinner = false;
          }
        }
      );
    } else {
      this.notificationId = 'ss-document-upload-error';
      let error = {
        'field': 'file',
        'message': 'Unsupported file format - Please select a file with extension .pdf, .doc, .docx, .xls, .xlsx',
        'code': 'ps.fileservice.file.format.not.allowed'
      };
      this.handleErrorResponse(error);
    }
  }

  updateUploadReport() {
    this.isSaveButtonDisabled = true;
    let formValue = this.form.getRawValue();
    let data = {
      agencyReport: {
        fileName: this.reportFileName,
        feedBack: formValue?.feedback,
        remarks: formValue?.remarks,
        projectDocumentId: this.reportProjectId
      },
      allocateAgencyId: this.allocatedAgencyId,
    };

    const fileServiceRequest: any = {
      projectId: this.projectId,
      fileId: this.fileId,
      formData: JSON.stringify(data),
      screenCode: this.screenEntitlementCodes.stepCodes.viewAgencyUpdateReport,
      workflowCode: 'APF',
      workflowStepCode: this.screenEntitlementCodes.stepCodes.viewAgencyUpdateReport,
      workflowActionCode: this.screenEntitlementCodes.screenActions.uploadReport,
      entityId: this.agencyDetails?.agencyId,
      entityName: this.reportFileName
    };

    let formData = new FormData();
    formData.append('fileServiceRequest', JSON.stringify(fileServiceRequest));

    this.uploadReportService.updateUploadReport(formData).subscribe(
      {
        next: (response: any) => {
          this.isSaveButtonDisabled = false;
          this.form.get('reportName')?.enable();
          this.reportFileName = '';
          this.reportFileExtension = '';
          this.notificationId = 'ss-report-upload-success';
          response.code = 'ps.report.upload.successful';
	  
	  // IIFL START
          const metaData = response?.metaData;

          // for iifl Check if addlParams is null for sudo agency/user
          // IIFL Start
          if (this.applicationEntitlementsService?.projectEntitlement?.addlParams?.isPseudoAgencyLogin === 'Yes') {
            metaData.addlParams = {isPseudoAgencyLogin: 'Yes'};
            this.handleSuccessResponse(response);
            this.cancel();
            this.applicationEntitlementsService.setEntitlementEvent();
            this.form.get('reportName')?.reset();
            this.form.get('reportName')?.updateValueAndValidity();
          }
	  // IIFL END
          else {
            this.applicationEntitlementsService.updateProjectEntitlements(response?.metaData);
            this.handleSuccessResponse(response);
            this.cancel();
            this.applicationEntitlementsService.setEntitlementEvent();
            this.form.get('reportName')?.reset();
            this.form.get('reportName')?.updateValueAndValidity();
          }
        },
        error: (error: any) => {
          this.isSaveButtonDisabled = false;
	  // IIFL START
          if (error?.error?.status === 422) {
            this.notificationId = 'ss-document-upload-error';
            this.handleErrorResponse(error?.error?.valErrors[0]);
          } else {
            this.notificationId = this.componentId;
            this.handleErrorResponse(error);
          }
          // IIFL Start
          this.isAgencyReportShowSpinner = false;
	  // IIFL END
        }
      }
    );
  }

  uploadDocument() {
    if (this.documentsDataSource.length <= 20) {
      if (this.docFileExtension === 'jpg' || this.docFileExtension === 'jpeg' || this.docFileExtension === 'png' || this.docFileExtension === 'tiff' || this.docFileExtension === 'pdf' || this.docFileExtension === 'doc' || this.docFileExtension === 'docx') {
        this.isShowSpinner = true;
        // IIFL START
        let user = {
          userId: this.userDetails?.userId,
          userName: this.userDetails?.username
        };
        // IIFL END

        let data = {
          agencyReportDocument: {
            fileName: this.documentFileName,
          },
          allocateAgencyId: this.allocatedAgencyId,
          documentType: 'DOC',
	  // IIFL START
          user: this.userDetails ? user: null
	  // IIFL END
        };

        const fileServiceRequest: any = {
          projectId: this.projectId,
          formData: JSON.stringify(data),
          screenCode: this.screenEntitlementCodes.stepCodes.viewAgencyUpdateReport,
          workflowCode: 'APF',
          workflowStepCode: this.screenEntitlementCodes.stepCodes.viewAgencyUpdateReport,
          workflowActionCode: this.screenEntitlementCodes.screenActions.uploadReport,
          entityId: this.agencyDetails?.agencyId,
          entityName: this.documentFileName
        };

        let formData = new FormData();
        formData.append('file', this.fileObj, this.documentFileName);
        formData.append('fileServiceRequest', JSON.stringify(fileServiceRequest));

        this.uploadReportService.uploadReport(formData).subscribe(
          {
            next: (response: any) => {
              if (response?.status === 422) {
                if (response?.valErrors[0].code === 'ps.fileservice.file.format.not.allowed') {
                  response.valErrors[0].code = 'ps.fileservice.report.file.format.not.allowed';
                }
                this.notificationId = 'ss-document-upload-error';
                this.handleErrorResponse(response?.valErrors[0]);
                // IIFL START
                this.form.markAsDirty();
                // IIFL END
              } else {
                this.form.get('documentName')?.enable();
                this.documentFileName = '';
                this.docFileExtension = '';
                setTimeout(() => {
                  this.docTableConfig.refresh();
                  this.getDocumentsList();
                }, 500);

                this.form.get('documentName')?.reset();
                this.form.get('documentName')?.updateValueAndValidity();
              }
              this.isShowSpinner = false;
            },
            error: (error: any) => {
              if (error?.error?.status === 422) {
                this.notificationId = 'ss-document-upload-error';
                this.handleErrorResponse(error?.error?.valErrors[0]);
              } else {
                this.notificationId = 'ss-document-upload-error';
                this.handleErrorResponse(error);
              }
              this.isShowSpinner = false;
            }
          }
        );
      } else {
        this.notificationId = 'ss-document-upload-error';
        let error = {
          'field': 'file',
          'message': 'Unsupported file format - Please select a file with extension .jpg, .jpeg, .png, .tiff, .pdf, .doc, .docx',
          'code': 'ps.fileservice.report.file.format.not.allowed'
        };
        this.handleErrorResponse(error);

      }
    }
  }

  public openDeleteDialog(item: any): void {
    const warningData: DeleteMsg = {
      headerBody: {
        params: {
          name: item?.fileName,
        },
      },
    };
    this.showDeleteWarning(warningData)
      .afterClosed()
      .subscribe((result: any) => {
        if (result) {
          this.deleteDoc(item?.id);
        }
      });
  }

  public openReportDeleteDialog(item: any): void {
    const warningData: DeleteMsg = {
      headerBody: {
        bodyText: 'Are you sure you want to delete the Report, Feedback and Remarks?'
      },
    };
    this.showDeleteWarning(warningData)
      .afterClosed()
      .subscribe((result: any) => {
        if (result) {
          this.deleteReport(item?.id);
        }
      });
  }
  /**
  * on delete it will call api wit specific id
  * @param id
  * @param type
  */
  public deleteDoc(id: any): void {
    this.uploadReportService.deleteDoc(id).subscribe({
      next: (response: any) => {
        this.notificationId = 'ss-document-delete-success';
        this.handleSuccessResponse(response);
        this.docTableConfig.refresh();
        this.getDocumentsList();
      },
      error: (error) => {
        if (error?.error?.status === 422) {
          this.notificationId = this.componentId;
          this.handleErrorResponse(error?.error?.valErrors[0]);
        } else {
          this.notificationId = this.componentId;
          this.handleErrorResponse(error);
        }
      },
    });
  }

  /**
  * on delete it will call api wit specific id
  * @param id
  * @param type
  */
  public deleteReport(id: any): void {
    this.uploadReportService.deleteReport(id).subscribe({
      next: (response: any) => {
        this.notificationId = 'ss-report-delete-success';
        this.form.reset({
          feedback: null,
          remarks: null
        });
        this.handleSuccessResponse(response);
        this.reportTableConfig.refresh();
        this.getReportsList();
      },
      error: (error) => {
        if (error?.error?.status === 422) {
          this.notificationId = this.componentId;
          this.handleErrorResponse(error?.error?.valErrors[0]);
        } else {
          this.notificationId = this.componentId;
          this.handleErrorResponse(error);
        }
      },
    });
  }

  public downloadDocument(documentId: any, fileName: any) {
    this.uploadReportService.downloadDocument(documentId).subscribe(
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

  cancel() {
    this.router.navigate([this.getFormattedPath(this.allocateAgencyRouterLinks.ALLOCATE_AGENCY, { projectId: this.projectId })], {
      queryParams: { accordion: 'upload-report' }
    });
  }

  public keyValueChange(event: any) {
    if (event.which === 32 && event.target.selectionStart === 0) {
      event.preventDefault();
    }
  }
}
