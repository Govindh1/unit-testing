import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';

import { ProjectDocumentsComponent } from './project-documents.component';
import { ProjectsTestingModule } from 'src/app/features/project-dashboard/projects-testing.module';
import { ProjectDocumentConfig } from 'iifl-primesquare-base-ui-configs';
import { ProjectsBaseInformationService } from '../../services/projects-base-information/projects-base-information.service';
import { of, throwError } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { ToolTipPipePipe } from 'src/app/shared/pipes/tool-tip-pipe.pipe';
import { ApplicationEntitlementsService } from 'src/app/core-services/entitlemets/application-entitlements/application-entitlements.service';
import { DebugElement } from '@angular/core';
import { SSTestHelper } from 'src/app/testing/test-helper';

describe('ProjectDocumentsComponent', () => {
  let component: ProjectDocumentsComponent;
  let fixture: ComponentFixture<ProjectDocumentsComponent>;
  let service: ProjectsBaseInformationService;
  let applicationEntitlementsService: ApplicationEntitlementsService;
  let listData: any = {
    'status': 200,
    'responseMessage': 'List retrieved successfully.',
    'data': {
      'content': [
        {
          'fromWhom': 'Sham',
          'inFavorOf': 'Ram',
          'projectStepCode': 'SCREEN3',
          'uploadedBy': 'Sham',
          'documentType': {
            'name': 'dream',
            'documentTypeId': 1
          },
          'uploadDate': '2023-06-27T05:01:06',
          'remarks': 'Pending',
          'fileServiceIdentifier': 2,
          'projectDocumentId': 5,
          'fileName': 'download.pdf'
        }
      ],
      'pageable': {
        'sort': {
          'empty': false,
          'sorted': true,
          'unsorted': false
        },
        'offset': 0,
        'pageNumber': 0,
        'pageSize': 10,
        'paged': true,
        'unpaged': false
      },
      'last': true,
      'totalElements': 1,
      'totalPages': 1,
      'size': 10,
      'number': 0,
      'sort': {
        'empty': false,
        'sorted': true,
        'unsorted': false
      },
      'first': true,
      'numberOfElements': 1,
      'empty': false
    },
    'timestamp': '2023-06-30T08:55:21Z',
    'code': 'ps.master.commons.get.successful'
  };
  let dialogData: any = {
    fileName: 'Brigade Rubix',
    fileId: '1',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsTestingModule],
      declarations: [ProjectDocumentsComponent, ToolTipPipePipe],
      providers: [ProjectDocumentConfig, ProjectsBaseInformationService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.inject(ProjectsBaseInformationService);
    applicationEntitlementsService = TestBed.inject(ApplicationEntitlementsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(' API download success', fakeAsync(() => {
    let data: any = new Blob;
    let documentId = '1';
    let fileName: any = 'tt';
    spyOn(service, 'downloadDocument').and.returnValue(of(data));

    spyOn(component, 'downloadDocument').and.callThrough();

    fixture.detectChanges();
    component.downloadDocument(documentId, fileName);
    tick();
    expect(component.downloadDocument).toHaveBeenCalled();

  }));

  it('Call an API on downloadDocument error', fakeAsync(() => {
    let documentId = '1';
    let fileName: any = 'tt';

    spyOn(service, 'downloadDocument').and.returnValue(throwError(() => new Error('')));

    spyOn(component, 'handleErrorResponse').and.callThrough();

    fixture.detectChanges();
    component.downloadDocument(documentId, fileName);
    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('Call an API on downloadDocument error 422 esponse', fakeAsync(() => {
    let documentId = '1';
    let fileName: any = 'tt';
    let error = {
      'status': 422,
      'error': {
        'status': 422,
        'valErrors': [
          {
            'fieldName': 'frcStatus',
            'message': 'Status is mandatory.',
            'code': 'ps.project.document.download'
          }
        ]
      },
      'responseMessage': 'Unprocessable request.',

    };
    spyOn(service, 'downloadDocument').and.returnValue(throwError(() => error));

    spyOn(component, 'handleErrorResponse').and.callThrough();
    fixture.detectChanges();
    component.downloadDocument(documentId, fileName);

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('should call onLoad()', fakeAsync(() => {

    spyOn(service, 'loadDocumentList').and.returnValue(of(listData));
    tick();
    let hook = component.tableHook;
    if (hook.onLoad) {
      hook.onLoad({}).subscribe(result => {
        expect(result).toEqual(listData);
      });
    }
  }));

  it('should call paginate()', fakeAsync(() => {
    let id: any = '';
    let state: any = {};
    spyOn(service, 'loadDocumentList').and.returnValue(of(listData));
    tick();
    let hook = component.tableHook;
    if (hook.onPaginate) {
      hook.onPaginate(id, state).subscribe(result => {
        expect(result).toEqual(listData);
      });
    }
  }));

  it('should call onRefresh()', fakeAsync(() => {
    let id: any = '';
    spyOn(service, 'loadDocumentList').and.returnValue(of(listData));
    tick();
    let hook = component.tableHook;
    if (hook.onRefresh) {
      hook.onRefresh(id).subscribe(result => {
        expect(result).toEqual(listData);
      });
    }
  }));

  it(' API documentTypeList success', fakeAsync(() => {
    spyOn(service, 'loadDocumentList').and.returnValue(of(listData));

    spyOn(component, 'documentTypeList').and.callThrough();

    fixture.detectChanges();
    component.documentTypeList();
    tick();
    expect(component.documentTypeList).toHaveBeenCalled();

  }));

  it('Call an API on documentTypeList error', fakeAsync(() => {

    spyOn(service, 'documentTypeList').and.returnValue(throwError(() => new Error('')));
    fixture.detectChanges();
    component.documentTypeList();

    tick();
    expect(component.documentTypeArrayOptions).toEqual([]);
  }));

  it(' API checkFileValidation success', fakeAsync(() => {
    component.fileObj = {
      size: 3102365,
      name: 'lkk'
    };
    spyOn(component, 'checkFileValidation').and.callThrough();

    fixture.detectChanges();
    component.checkFileValidation(component.fileObj);
    tick();
    expect(component.checkFileValidation).toHaveBeenCalled();

  }));

  it('Call an API on success of documentTypeList Options', fakeAsync(() => {
    let data: any = [
      {
        'key': 16,
        'value': '11112222'
      }
    ];
    spyOn(service, 'documentTypeList').and.returnValue(of(data));
    spyOn(component, 'documentTypeList').and.callThrough();
    tick();
    component.documentTypeList();
    expect(component.documentTypeList).toHaveBeenCalled();
  }));

  it('should open dialog', fakeAsync(() => {
    let item: any = {
      name: 'Brigade Rubix'
    };
    spyOn(component, 'openDeleteDialog').and.callThrough();
    component.openDeleteDialog(item);
    fixture.detectChanges();
    tick();
    expect(component.openDeleteDialog).toHaveBeenCalledWith(item);
  }));

  it('should close dialog', fakeAsync(() => {
    spyOn(component.dialog, 'open')
      .and
      .returnValue({
        afterClosed: () => of(true)
      } as MatDialogRef<typeof component>);
    spyOn(service, 'deleteDocument').and.returnValue(of(true));
    component.openDeleteDialog(dialogData);
    fixture.detectChanges();
    component.dialogRef.afterClosed().subscribe(result => {
      expect(service.deleteDocument).toHaveBeenCalled();
      expect(result).toEqual(true);
    });
  }));

  it('should close dialog with errored delete', fakeAsync(() => {
    spyOn(component.dialog, 'open')
      .and
      .returnValue({
        afterClosed: () => of(true)
      } as MatDialogRef<typeof component>);
    spyOn(service, 'deleteDocument').and.callThrough();
    component.openDeleteDialog('1');
    fixture.detectChanges();
    component.dialogRef.afterClosed().subscribe(result => {
      expect(service.deleteDocument).toHaveBeenCalled();
      expect(result).toEqual(true);
    });
  }));

  it('should close dialog with errored 422 delete', fakeAsync(() => {
    let data = {
      status: 422,
      error: {
        status: 422,
        responseMessage: 'Unprocessable request.',
        valErrors: [
          {
            fieldName: 'projectdocumentid',
            message: 'Builder Group in use, cannot be deleted.',
            code: 'ps.project.document.id.active'
          }
        ]
      }
    };
    spyOn(component, 'handleErrorResponse').and.callThrough();
    spyOn(component.dialog, 'open')
      .and
      .returnValue({
        afterClosed: () => of(data)
      } as MatDialogRef<typeof component>);
    spyOn(service, 'deleteDocument').and.returnValue(throwError(() => data));
    component.openDeleteDialog(dialogData);
    fixture.detectChanges();
    component.dialogRef.afterClosed().subscribe(result => {
      expect(component.handleErrorResponse).toHaveBeenCalled();
      expect(result).toEqual(data);
    });
  }));

  it('Call an API on delete error', fakeAsync(() => {

    spyOn(component, 'handleErrorResponse').and.callThrough();
    spyOn(service, 'deleteDocument').and.returnValue(throwError(() => new Error('')));
    fixture.detectChanges();
    component.delete(dialogData.fileId);

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('Call an API on patch value', fakeAsync(() => {
    let details = {
      fileId: 1,
      fileName: '',
    };
    spyOn(component, 'patchFormValue').and.callThrough();
    fixture.detectChanges();
    component.patchFormValue(details);

    tick();
    expect(component.patchFormValue).toHaveBeenCalled();
  }));

  it('Call an API on cancel value', fakeAsync(() => {

    spyOn(component, 'cancelEdit').and.callThrough();
    fixture.detectChanges();
    component.cancelEdit();

    tick();
    expect(component.cancelEdit).toHaveBeenCalled();
  }));


  it('Call an checkTableActionEntitlement else method', fakeAsync(() => {

    spyOn(component, 'checkTableActionEntitlement').and.callThrough();

    component.checkTableActionEntitlement('', []);

  }));



  it('Call an checkTableActionEntitlement method', fakeAsync(() => {

    spyOn(applicationEntitlementsService, 'checkTableActionEntitlement').and.returnValue(true);

    spyOn(component, 'checkTableActionEntitlement').and.callThrough();

    component.checkTableActionEntitlement('VIEWAGENCY', [{

      'actionCode': 'VIEWAGENCY',

      'mode': 'VIEW'

    }]);

  }));

  it('Call an checkFormDisability method', fakeAsync(() => {
    component.fileEdited = true;
    spyOn(component, 'checkFormDisability').and.callThrough();
    component.checkFormDisability();
    expect(component.checkFormDisability).toHaveBeenCalled();
  }));

  it('Call an checkFormDisability method', fakeAsync(() => {
    component.fileEdited = true;
    component.notificationId = 'ss-upload-document-error';
    spyOn(component, 'checkFormDisability').and.callThrough();
    component.checkFormDisability();
    expect(component.checkFormDisability).toHaveBeenCalled();
  }));
  it('Call an checkFormDisability method', fakeAsync(() => {
    spyOn(component, 'checkFormDisability').and.callThrough();
    component.checkFormDisability();
    expect(component.checkFormDisability).toHaveBeenCalled();
  }));

  it('Call an checkScreenMode method', fakeAsync(() => {
    spyOn(applicationEntitlementsService, 'getEditableStepCodesEntitlementMode').and.returnValue('EDIT');
    component.screenMode = 'EDIT';
    spyOn(component, 'checkScreenMode').and.callThrough();
    component.checkScreenMode();
    expect(component.checkScreenMode).toHaveBeenCalled();
  }));

  it('Call an onDocumentFileSelected method', fakeAsync(() => {
    spyOn(component, 'onDocumentFileSelected').and.callThrough();
    component.onDocumentFileSelected([]);
    expect(component.onDocumentFileSelected).toHaveBeenCalled();
  }));

  it('API document upload success', fakeAsync(() => {
    let data: any = {
      status: 200,
      responseMessage: 'File uploaded successfully',
      data: {
        'projectId': '2',
        'formData': '{"fromWhom":"dcf","inFavourOf":"r ","documentType":{"name":"document6","id":4},"fileName":"PS_Square_v0.6 (5).pdf","remark":"de"}',
        'screenCode': 'PROJECTDOCUMENT',
        'filePath': '2/DOC_UPLOAD/',
      },
      'timestamp': '2023-06-30T10:12:19Z',
      'code': 'ps.fileservice.upload.successful'
    };
    component.fileExtension = 'pdf';
    component.fileObj = {
      name: '',
      size: 3102365,
    };
    component.projectId = '1';
    spyOn(window, 'FormData').and.returnValue({
      'append': jasmine.createSpy(),
      delete: function (name: string): void {
        throw new Error('Function not implemented.');
      },
      get: function (name: string): FormDataEntryValue | null {
        throw new Error('Function not implemented.');
      },
      getAll: function (name: string): FormDataEntryValue[] {
        throw new Error('Function not implemented.');
      },
      has: function (name: string): boolean {
        throw new Error('Function not implemented.');
      },
      set: function (name: string, value: string | Blob): void {
        throw new Error('Function not implemented.');
      },
      forEach: function (callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any): void {
        throw new Error('Function not implemented.');
      }
    });

    spyOn(service, 'uploadDocument').and.returnValue(of(data));

    fixture.detectChanges();
    component.uploadDocument();
    tick();
    flush();

  }));

  it('API document upload success with 422', fakeAsync(() => {
    let data: any = {
      status: 422,
      responseMessage: 'File uploaded successfully',
      data: {
        'projectId': '2',
        'formData': '{"fromWhom":"dcf","inFavourOf":"r ","documentType":{"name":"document6","id":4},"fileName":"PS_Square_v0.6 (5).pdf","remark":"de"}',
        'screenCode': 'PROJECTDOCUMENT',
        'filePath': '2/DOC_UPLOAD/',
      },
      'timestamp': '2023-06-30T10:12:19Z',
      'code': 'ps.fileservice.upload.successful',
      valErrors: []
    };
    component.fileExtension = 'pdf';
    component.fileObj = {
      name: '',
      size: 3102365,
    };
    component.projectId = '1';
    spyOn(window, 'FormData').and.returnValue({
      'append': jasmine.createSpy(),
      delete: function (name: string): void {
        throw new Error('Function not implemented.');
      },
      get: function (name: string): FormDataEntryValue | null {
        throw new Error('Function not implemented.');
      },
      getAll: function (name: string): FormDataEntryValue[] {
        throw new Error('Function not implemented.');
      },
      has: function (name: string): boolean {
        throw new Error('Function not implemented.');
      },
      set: function (name: string, value: string | Blob): void {
        throw new Error('Function not implemented.');
      },
      forEach: function (callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any): void {
        throw new Error('Function not implemented.');
      }
    });

    spyOn(service, 'uploadDocument').and.returnValue(of(data));

    fixture.detectChanges();
    component.uploadDocument();
    tick();
    flush();

  }));

  it('Call an API on upload error', fakeAsync(() => {
    component.fileExtension = 'pdf';
    component.projectId = '';
    spyOn(window, 'FormData').and.returnValue({
      'append': jasmine.createSpy(),
      delete: function (name: string): void {
        throw new Error('Function not implemented.');
      },
      get: function (name: string): FormDataEntryValue | null {
        throw new Error('Function not implemented.');
      },
      getAll: function (name: string): FormDataEntryValue[] {
        throw new Error('Function not implemented.');
      },
      has: function (name: string): boolean {
        throw new Error('Function not implemented.');
      },
      set: function (name: string, value: string | Blob): void {
        throw new Error('Function not implemented.');
      },
      forEach: function (callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any): void {
        throw new Error('Function not implemented.');
      }
    });
    spyOn(component, 'handleErrorResponse').and.callThrough();
    spyOn(service, 'uploadDocument').and.returnValue(throwError(() => new Error('')));
    fixture.detectChanges();
    component.uploadDocument();

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('Call an API on upload 422 error', fakeAsync(() => {
    component.fileExtension = 'pdf';
    component.projectId = '';
    let error = {
      status: 422,
      valErrors: []
    };
    spyOn(window, 'FormData').and.returnValue({
      'append': jasmine.createSpy(),
      delete: function (name: string): void {
        throw new Error('Function not implemented.');
      },
      get: function (name: string): FormDataEntryValue | null {
        throw new Error('Function not implemented.');
      },
      getAll: function (name: string): FormDataEntryValue[] {
        throw new Error('Function not implemented.');
      },
      has: function (name: string): boolean {
        throw new Error('Function not implemented.');
      },
      set: function (name: string, value: string | Blob): void {
        throw new Error('Function not implemented.');
      },
      forEach: function (callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any): void {
        throw new Error('Function not implemented.');
      }
    });
    spyOn(component, 'handleErrorResponse').and.callThrough();
    spyOn(service, 'uploadDocument').and.returnValue(throwError(() => error));
    fixture.detectChanges();
    component.uploadDocument();

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('call document upload with fileExtension jog', fakeAsync(() => {
    component.fileExtension = 'jpg';
    component.uploadDocument();
    tick();
  }));

  it('API editUploadDocument success', fakeAsync(() => {
    let data: any = {
      status: 200,
      responseMessage: 'File uploaded successfully',
      data: {
        'projectId': '2',
        'formData': '{"fromWhom":"dcf","inFavourOf":"r ","documentType":{"name":"document6","id":4},"fileName":"PS_Square_v0.6 (5).pdf","remark":"de"}',
        'screenCode': 'PROJECTDOCUMENT',
        'filePath': '2/DOC_UPLOAD/',
      },
      'timestamp': '2023-06-30T10:12:19Z',
      'code': 'ps.fileservice.upload.successful'
    };
    component.fileExtension = 'pdf';
    component.fileObj = {
      name: '',
      size: 3102365,
    };
    component.projectId = '1';
    spyOn(window, 'FormData').and.returnValue({
      'append': jasmine.createSpy(),
      delete: function (name: string): void {
        throw new Error('Function not implemented.');
      },
      get: function (name: string): FormDataEntryValue | null {
        throw new Error('Function not implemented.');
      },
      getAll: function (name: string): FormDataEntryValue[] {
        throw new Error('Function not implemented.');
      },
      has: function (name: string): boolean {
        throw new Error('Function not implemented.');
      },
      set: function (name: string, value: string | Blob): void {
        throw new Error('Function not implemented.');
      },
      forEach: function (callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any): void {
        throw new Error('Function not implemented.');
      }
    });

    spyOn(service, 'editUploadDocument').and.returnValue(of(data));

    fixture.detectChanges();
    component.editUploadDocument();
    tick();
    flush();

  }));

  it('API editUploadDocument success with 422', fakeAsync(() => {
    let data: any = {
      status: 422,
      responseMessage: 'File uploaded successfully',
      data: {
        'projectId': '2',
        'formData': '{"fromWhom":"dcf","inFavourOf":"r ","documentType":{"name":"document6","id":4},"fileName":"PS_Square_v0.6 (5).pdf","remark":"de"}',
        'screenCode': 'PROJECTDOCUMENT',
        'filePath': '2/DOC_UPLOAD/',
      },
      'timestamp': '2023-06-30T10:12:19Z',
      'code': 'ps.fileservice.upload.successful',
      valErrors: []
    };
    component.fileExtension = 'pdf';
    component.fileObj = {
      name: '',
      size: 3102365,
    };
    component.projectId = '1';
    spyOn(window, 'FormData').and.returnValue({
      'append': jasmine.createSpy(),
      delete: function (name: string): void {
        throw new Error('Function not implemented.');
      },
      get: function (name: string): FormDataEntryValue | null {
        throw new Error('Function not implemented.');
      },
      getAll: function (name: string): FormDataEntryValue[] {
        throw new Error('Function not implemented.');
      },
      has: function (name: string): boolean {
        throw new Error('Function not implemented.');
      },
      set: function (name: string, value: string | Blob): void {
        throw new Error('Function not implemented.');
      },
      forEach: function (callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any): void {
        throw new Error('Function not implemented.');
      }
    });

    spyOn(service, 'editUploadDocument').and.returnValue(of(data));

    fixture.detectChanges();
    component.editUploadDocument();
    tick();
    flush();

  }));

  it('Call an API on editUploadDocument error', fakeAsync(() => {
    component.fileExtension = 'pdf';
    component.projectId = '';
    spyOn(window, 'FormData').and.returnValue({
      'append': jasmine.createSpy(),
      delete: function (name: string): void {
        throw new Error('Function not implemented.');
      },
      get: function (name: string): FormDataEntryValue | null {
        throw new Error('Function not implemented.');
      },
      getAll: function (name: string): FormDataEntryValue[] {
        throw new Error('Function not implemented.');
      },
      has: function (name: string): boolean {
        throw new Error('Function not implemented.');
      },
      set: function (name: string, value: string | Blob): void {
        throw new Error('Function not implemented.');
      },
      forEach: function (callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any): void {
        throw new Error('Function not implemented.');
      }
    });
    spyOn(component, 'handleErrorResponse').and.callThrough();
    spyOn(service, 'editUploadDocument').and.returnValue(throwError(() => new Error('')));
    fixture.detectChanges();
    component.editUploadDocument();

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('Call an API on editUploadDocument 422 error', fakeAsync(() => {
    component.fileExtension = 'pdf';
    component.projectId = '';
    let error = {
      status: 422,
      valErrors: []
    };
    spyOn(window, 'FormData').and.returnValue({
      'append': jasmine.createSpy(),
      delete: function (name: string): void {
        throw new Error('Function not implemented.');
      },
      get: function (name: string): FormDataEntryValue | null {
        throw new Error('Function not implemented.');
      },
      getAll: function (name: string): FormDataEntryValue[] {
        throw new Error('Function not implemented.');
      },
      has: function (name: string): boolean {
        throw new Error('Function not implemented.');
      },
      set: function (name: string, value: string | Blob): void {
        throw new Error('Function not implemented.');
      },
      forEach: function (callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: any): void {
        throw new Error('Function not implemented.');
      }
    });
    spyOn(component, 'handleErrorResponse').and.callThrough();
    spyOn(service, 'editUploadDocument').and.returnValue(throwError(() => error));
    fixture.detectChanges();
    component.editUploadDocument();

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('call editUploadDocument with fileExtension jog', fakeAsync(() => {
    component.fileExtension = 'jpg';
    component.editUploadDocument();
    tick();
  }));

  it('Call an uploadDocument', fakeAsync(() => {
    component.editDocument = false;
    component.isShowSpinner = false;
    spyOn(component, 'checkScreenMode').and.returnValue(true);

    spyOn(component, 'saveDocument').and.callThrough();
    spyOn(component, 'uploadDocument').and.callThrough();
    fixture.detectChanges();
    const createBtn: DebugElement = SSTestHelper.findElement(fixture, '#btn-doc-upload');
    createBtn.triggerEventHandler('click', null);

    tick();
    expect(component.uploadDocument).toHaveBeenCalled();
  }));

  it('Call an editUploadDocument', fakeAsync(() => {
    component.editDocument = true;
    component.isShowSpinner = false;
    component.fileId = 1;
    spyOn(component, 'checkScreenMode').and.returnValue(true);

    spyOn(component, 'saveDocument').and.callThrough();
    spyOn(component, 'editUploadDocument').and.callThrough();
    fixture.detectChanges();
    const createBtn: DebugElement = SSTestHelper.findElement(fixture, '#btn-doc-upload-edit');
    createBtn.triggerEventHandler('click', null);

    tick();
    expect(component.editUploadDocument).toHaveBeenCalled();
  }));
});
