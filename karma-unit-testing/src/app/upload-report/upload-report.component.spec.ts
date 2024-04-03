import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';

import { UploadReportComponent } from './upload-report.component';
import { FormBuilder } from '@angular/forms';
import { ProjectsTestingModule } from '../../../projects-testing.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DebugElement } from '@angular/core';
import { SSTestHelper } from 'src/app/testing/test-helper';
import { of, throwError } from 'rxjs';
import { UploadReportService } from '../../services/upload-report.service';
import { MatDialogRef } from '@angular/material/dialog';
import { UpdateReportConfig } from 'iifl-primesquare-base-ui-configs';
import { Routes } from '@angular/router';
import { AgencyVerificationComponent } from '../agency-verification/agency-verification.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('UploadReportComponent', () => {
  let component: UploadReportComponent;
  let fixture: ComponentFixture<UploadReportComponent>;
  let uploadReportService: UploadReportService;

  const formBuilder: FormBuilder = new FormBuilder();
  let dialogData = {};
  let tableData = {};
  let routerLinks: Routes = [
    {
      path: 'projects/agency/agency/base/agency-verification/1',
      component: AgencyVerificationComponent
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadReportComponent],
      imports: [
        ProjectsTestingModule,
        RouterTestingModule.withRoutes(routerLinks),
        MatTooltipModule
      ],
      providers: [
        { provide: FormBuilder, useValue: formBuilder },
        UpdateReportConfig
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    uploadReportService = TestBed.inject(UploadReportService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call on onDocumentFileSelected', () => {
    let fileData = [
      {
        name: 'PS_Manage User_v0.2.pdf',
        size: 1001490,
        type: 'application/pdf'
      }
    ];

    let mockFileReader = {
      result: '',
      readAsDataURL: (blobInput: any) => {
      },
      onloadend: () => {
      }
    };

    spyOn<any>(window, 'FileReader').and.returnValue(mockFileReader);

    spyOn(component, 'onDocFileSelected').and.callThrough();
    component.onDocFileSelected(fileData);
    fixture.detectChanges();
    expect(component.onDocFileSelected).toHaveBeenCalledWith(fileData);
  });

  it('should call on onReportFileSelected', () => {
    let fileData = [
      {
        name: 'PS_Manage User_v0.2.pdf',
        size: 5267509,
        type: 'application/pdf'
      }
    ];

    spyOn(component, 'onReportFileSelected').and.callThrough();
    component.onReportFileSelected(fileData);
    fixture.detectChanges();
    expect(component.onReportFileSelected).toHaveBeenCalledWith(fileData);
  });

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
    component.docFileExtension = 'jpg';
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

    spyOn(uploadReportService, 'uploadReport').and.returnValue(of(data));

    fixture.detectChanges();

    const createBtn: DebugElement = SSTestHelper.findElement(fixture, '#btn-doc-upload');
    createBtn.triggerEventHandler('click', null);
    tick();
    flush();

  }));

  it('Call an API on upload error', fakeAsync(() => {
    component.docFileExtension = 'jpg';
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
    spyOn(uploadReportService, 'uploadReport').and.returnValue(throwError(() => new Error('')));
    fixture.detectChanges();
    const createBtn: DebugElement = SSTestHelper.findElement(fixture, '#btn-doc-upload');
    createBtn.triggerEventHandler('click', null);

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('API report upload success', fakeAsync(() => {
    component.reportFileExtension = 'pdf';
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

    spyOn(uploadReportService, 'uploadReport').and.returnValue(of(data));
    spyOn(component, 'cancel').and.callThrough();

    fixture.detectChanges();

    const createBtn: DebugElement = SSTestHelper.findElement(fixture, '#btn-create');
    createBtn.triggerEventHandler('click', null);
    tick();
    expect(component.cancel).toHaveBeenCalled();

  }));

  it('Call an API on upload error', fakeAsync(() => {

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
    spyOn(uploadReportService, 'uploadReport').and.returnValue(throwError(() => new Error('')));
    fixture.detectChanges();
    const createBtn: DebugElement = SSTestHelper.findElement(fixture, '#btn-create');
    createBtn.triggerEventHandler('click', null);

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('API report upload success', fakeAsync(() => {
    component.reportFileExtension = 'pdf';
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

    component.projectId = '1';
    component.reportProjectId = 1;

    spyOn(uploadReportService, 'updateUploadReport').and.returnValue(of(data));
    spyOn(component, 'cancel').and.callThrough();

    fixture.detectChanges();

    const createBtn: DebugElement = SSTestHelper.findElement(fixture, '#btn-update');
    createBtn.triggerEventHandler('click', null);
    tick();
    expect(component.cancel).toHaveBeenCalled();

  }));

  it('Call an API on upload error', fakeAsync(() => {

    component.reportProjectId = 1;
    component.projectId = '';

    spyOn(component, 'handleErrorResponse').and.callThrough();
    spyOn(uploadReportService, 'updateUploadReport').and.returnValue(throwError(() => new Error('')));
    fixture.detectChanges();
    const createBtn: DebugElement = SSTestHelper.findElement(fixture, '#btn-update');
    createBtn.triggerEventHandler('click', null);

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('should close dialog', fakeAsync(() => {
    spyOn(component.dialog, 'open')
      .and
      .returnValue({
        afterClosed: () => of(true)
      } as MatDialogRef<typeof component>);
    spyOn(uploadReportService, 'deleteDoc').and.returnValue(of(true));
    component.openDeleteDialog(dialogData);
    fixture.detectChanges();
    component.dialogRef.afterClosed().subscribe(result => {
      expect(uploadReportService.deleteDoc).toHaveBeenCalled();
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
    spyOn(uploadReportService, 'deleteDoc').and.returnValue(throwError(() => data));
    component.openDeleteDialog(dialogData);
    fixture.detectChanges();
    component.dialogRef.afterClosed().subscribe(result => {
      expect(component.handleErrorResponse).toHaveBeenCalled();
      expect(result).toEqual(data);
    });
  }));

  it('Call an API on delete error', fakeAsync(() => {

    spyOn(component, 'handleErrorResponse').and.callThrough();
    spyOn(uploadReportService, 'deleteDoc').and.returnValue(throwError(() => new Error('')));
    fixture.detectChanges();
    component.deleteDoc('');

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('should close dialog', fakeAsync(() => {
    spyOn(component.dialog, 'open')
      .and
      .returnValue({
        afterClosed: () => of(true)
      } as MatDialogRef<typeof component>);
    spyOn(uploadReportService, 'deleteReport').and.returnValue(of(true));
    component.openReportDeleteDialog(dialogData);
    fixture.detectChanges();
    component.dialogRef.afterClosed().subscribe(result => {
      expect(uploadReportService.deleteReport).toHaveBeenCalled();
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
    spyOn(uploadReportService, 'deleteReport').and.returnValue(throwError(() => data));
    component.openReportDeleteDialog(dialogData);
    fixture.detectChanges();
    component.dialogRef.afterClosed().subscribe(result => {
      expect(component.handleErrorResponse).toHaveBeenCalled();
      expect(result).toEqual(data);
    });
  }));

  it('Call an API on delete error', fakeAsync(() => {

    spyOn(component, 'handleErrorResponse').and.callThrough();
    spyOn(uploadReportService, 'deleteReport').and.returnValue(throwError(() => new Error('')));
    fixture.detectChanges();
    component.deleteReport('');

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('should call onLoad()', fakeAsync(() => {
    spyOn(uploadReportService, 'load').and.returnValue(of(tableData));
    tick();
    let hook = component.tableHook;
    if (hook.onLoad) {
      hook.onLoad({}).subscribe(result => {
        expect(result).toEqual(tableData);
      });
    }
  }));

  it('should call onPaginate()', fakeAsync(() => {
    spyOn(uploadReportService, 'load').and.returnValue(of(tableData));
    let pageState = { pageNumber: 1, pageSize: 10 };
    tick();
    if (component.tableHook.onPaginate) {
      component.tableHook.onPaginate(pageState, {}).pipe().subscribe(
        result => {
          expect(result).toEqual(tableData);
        }
      );
    }
  }));

  it('should call onRefresh()', fakeAsync(() => {
    spyOn(uploadReportService, 'load').and.returnValue(of(tableData));
    tick();
    if (component.tableHook.onRefresh) {
      component.tableHook.onRefresh({}).pipe().subscribe(
        result => {
          expect(result).toEqual(tableData);
        }
      );
    }
  }));

  it('should call on reportTableHook for onLoad()', fakeAsync(() => {
    spyOn(uploadReportService, 'loadDocumentList').and.returnValue(of(tableData));
    tick();
    let hook = component.reportTableHook;
    if (hook.onLoad) {
      hook.onLoad({}).subscribe(result => {
        expect(result).toEqual(tableData);
      });
    }
  }));

  it('should call on reportTableHook for onRefresh()', fakeAsync(() => {
    spyOn(uploadReportService, 'loadDocumentList').and.returnValue(of(tableData));

    tick();
    if (component.reportTableHook.onRefresh) {
      component.reportTableHook.onRefresh({}).pipe().subscribe(
        result => {
          expect(result).toEqual(tableData);
        }
      );
    }
  }));

  it(' API getDocumentsList success', fakeAsync(() => {
    let listData = {
      records: [
        {
          fileName: 'no_name.pdf',
          id: 1
        }
      ]
    };
    spyOn(uploadReportService, 'loadDocumentList').and.returnValue(of(listData));

    spyOn(component, 'getDocumentsList').and.callThrough();

    fixture.detectChanges();
    component.getDocumentsList();
    tick();
    expect(component.getDocumentsList).toHaveBeenCalled();

  }));

  it('Call an API on getDocumentsList error', fakeAsync(() => {

    spyOn(uploadReportService, 'loadDocumentList').and.returnValue(throwError(() => new Error('')));

    fixture.detectChanges();
    component.getDocumentsList();
    tick();
    expect(uploadReportService.loadDocumentList).toHaveBeenCalled();
  }));

  it(' API getReportsList success', fakeAsync(() => {
    let listData = {
      records: [
        {
          id: 1,
          fileId: 2,
          feedback: 'Positive',
          remarks: 'no',
          fileName: 'no_name.pdf'
        }
      ]
    };
    spyOn(uploadReportService, 'loadReportList').and.returnValue(of(listData));

    spyOn(component, 'getReportsList').and.callThrough();

    fixture.detectChanges();
    component.getReportsList();
    tick();
    expect(component.getReportsList).toHaveBeenCalled();

  }));

  it('Call an API on getReportsList error', fakeAsync(() => {

    spyOn(uploadReportService, 'loadReportList').and.returnValue(throwError(() => new Error('')));

    fixture.detectChanges();
    component.getReportsList();
    tick();
    expect(uploadReportService.loadReportList).toHaveBeenCalled();
  }));

  it(' API download success', fakeAsync(() => {
    let data: any = new Blob;
    let documentId = '1';
    let fileName: any = 'tt';
    spyOn(uploadReportService, 'downloadDocument').and.returnValue(of(data));

    spyOn(component, 'downloadDocument').and.callThrough();

    fixture.detectChanges();
    component.downloadDocument(documentId, fileName);
    tick();
    expect(component.downloadDocument).toHaveBeenCalled();

  }));

  it('Call an API on downloadDocument error', fakeAsync(() => {
    let documentId = '1';
    let fileName: any = 'tt';

    spyOn(uploadReportService, 'downloadDocument').and.returnValue(throwError(() => new Error('')));

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
    spyOn(uploadReportService, 'downloadDocument').and.returnValue(throwError(() => error));

    spyOn(component, 'handleErrorResponse').and.callThrough();
    fixture.detectChanges();
    component.downloadDocument(documentId, fileName);

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('API report upload success 422', fakeAsync(() => {
    component.reportFileExtension = 'pdf';
    let data: any = {
      status: 422,
      responseMessage: 'File uploaded successfully',
      valErrors: [{
        'field': 'file',
        'message': 'Unsupported file format - Please select a file with extension .pdf, .doc, .docx, .xls, .xlsx',
        'code': 'ps.fileservice.file.format.not.allowed'
      }],
      'timestamp': '2023-06-30T10:12:19Z',
      'code': 'ps.fileservice.upload.successful'
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

    spyOn(uploadReportService, 'uploadReport').and.returnValue(of(data));
    spyOn(component, 'handleErrorResponse').and.callThrough();

    fixture.detectChanges();

    const createBtn: DebugElement = SSTestHelper.findElement(fixture, '#btn-create');
    createBtn.triggerEventHandler('click', null);
    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();

  }));

  it('Call an API on uploadReport error 422 esponse', fakeAsync(() => {
    component.reportFileExtension = 'pdf';
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
    spyOn(uploadReportService, 'uploadReport').and.returnValue(throwError(() => error));

    spyOn(component, 'handleErrorResponse').and.callThrough();
    fixture.detectChanges();
    component.uploadReport();

    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('Call an API on uploadReport error', fakeAsync(() => {
    component.reportFileExtension = 'pdf';
    spyOn(uploadReportService, 'uploadReport').and.returnValue(throwError(() => new Error('')));

    spyOn(component, 'handleErrorResponse').and.callThrough();

    fixture.detectChanges();
    component.uploadReport();
    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));

  it('Call an API on updateUploadReport error', fakeAsync(() => {
    component.projectId = '1';
    component.reportProjectId = '1';
    spyOn(uploadReportService, 'updateUploadReport').and.returnValue(throwError(() => new Error('')));

    spyOn(component, 'handleErrorResponse').and.callThrough();

    fixture.detectChanges();
    component.updateUploadReport();
    tick();
    expect(component.handleErrorResponse).toHaveBeenCalled();
  }));
  
  it('should call keyValueChange method', () => {
    let event = {
      bubbles: false,
      cancelBubble: false,
      cancelable: false,
      composed: false,
      currentTarget: null,
      defaultPrevented: false,
      eventPhase: 0,
      which: 32,
      isTrusted: false,
      returnValue: false,
      srcElement: null,
      target: {
        selectionStart: 0
      },
      timeStamp: 0,
      type: '',
      composedPath: function (): EventTarget[] {
        throw new Error('Function not implemented.');
      },
      initEvent: function (type: string, bubbles?: boolean | undefined, cancelable?: boolean | undefined): void {
        throw new Error('Function not implemented.');
      },
      preventDefault: function (): void {
      },
      stopImmediatePropagation: function (): void {
        throw new Error('Function not implemented.');
      },
      stopPropagation: function (): void {
        throw new Error('Function not implemented.');
      },
      NONE: 0,
      CAPTURING_PHASE: 1,
      AT_TARGET: 2,
      BUBBLING_PHASE: 3
    };
    spyOn(component ,'keyValueChange').and.callThrough();
    component.keyValueChange(event);
    expect(event.preventDefault).toHaveBeenCalled;
  });
});
