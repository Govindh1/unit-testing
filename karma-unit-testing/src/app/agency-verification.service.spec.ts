import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { throwError } from 'rxjs';
import { ProjAuthorizationConstants } from 'src/app/core-services/constants/authentication/projects-authorization-constants';
import { RestApiConnectorService } from 'src/app/core-services/services/rest-api-connector/rest-api-connector.service';
import { LocaleFormatterService } from 'src/app/shared/services/locale-formatter/locale-formatter.service';
import { SharedModule } from 'src/app/shared/shared.module';
import environment from 'src/assets/environment/environment.json';
import { ProjectsTestingModule } from '../../projects-testing.module';
import { PROJECTS } from '../commons/api/apiEndpoints';
import { AgencyVerificationService } from './agency-verification.service';

describe('AgencyVerificationService', () => {
  let service: AgencyVerificationService;
  let restApiConnectorService: RestApiConnectorService;
  let httpMock: HttpTestingController;
  let localeFormatterService: LocaleFormatterService;
  // IIFL Start
  let testData = {
    'status': 200,
    'message': 'List retrieved successfully.',
    'code': 'ps.commons.get.successful',
    'data': [
      {
        'userId': 1,
        'firstName': 'John',
        'middleName': 'K',
        'lastName': 'Albert'
      },
      {
        'userId': 2,
        'firstName': 'John',
        'middleName': 'K',
        'lastName': 'Albert'
      }
    ],
    'timestamp': '2023-03-29T09:46:07Z'
  };
  // IIFL End

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SharedModule, ProjectsTestingModule],
      providers: [RestApiConnectorService]
    });
    restApiConnectorService = TestBed.inject(RestApiConnectorService);
    httpMock = TestBed.inject(HttpTestingController);
    localeFormatterService = TestBed.inject(LocaleFormatterService);
    service = TestBed.inject(AgencyVerificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call on load allocate agency list api', () => {
    let loadTestData = {
      'status': 200,
      'responseMessage': 'List retrieved successfully.',
      'data': {
        'content': [
          {
            'agency': {
              'agencyId': 1,
              'name': 'Agency 1'
            },
            'agencyType': {
              'agencyTypeId': 1,
              'name': 'Technical'
            },
            'agencyStatus': 'INITIALVERIFICATION',
            'agencyStatusDescription': 'Initial Verification',
            'allocateAgencyId': 1,
            'assignedDate': '2023-03-29T09:46:07Z'
          }
        ],
        'pageable': {
          'sort': {
            'empty': true,
            'unsorted': true,
            'sorted': false
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
          'empty': true,
          'sorted': false,
          'unsorted': true
        },
        'first': true,
        'numberOfElements': 1,
        'empty': true
      },
      'code': 'ps.master.commons.get.successful',
      'timestamp': '2023-03-29T09:46:07Z'
    };
    let state = {
      pageOptions: {
        pageNumber: 0,
        pageSize: 10
      },
      projectId: '1'
    };
    service.load(state).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    const requestUrl: string = environment.apiUri + PROJECTS.allocateAgency.allocateAgencyList;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('POST');
    req.flush(loadTestData);
    httpMock.verify();
  });

  it('should check for error in load allocate agency when it is having error', fakeAsync(() => {
    let state = {
      pageOptions: {
        pageNumber: 0,
        pageSize: 10
      },
      projectId: '1'
    };
    spyOn(restApiConnectorService, 'post').and.returnValue(throwError(() => ('error')));
    service.load(state).subscribe({
      error: (error: any) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on load skip agency list api', () => {
    let loadTestData = {
      'status': 200,
      'responseMessage': 'List retrieved successfully.',
      'code': 'ps.commons.get.successful',
      'data': [
        {
          'agencyType': {
            'agencyTypeId': 3,
            'name': 'FCU'
          },
          'skipAgencyId': 1,
          'remarks': 'This is for skip agency type.'
        }
      ]
    };
    let state = {
      pageOptions: {
        pageNumber: 0,
        pageSize: 10
      },
      projectId: '1'
    };
    service.skipAgecnyLoad(state).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    const requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.skipAgencyList, { projectId: state.projectId }) + `?serviceKey=${'project/agencyveri'}&userAction=${'VIEWSKIPAGNCY'}`;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(loadTestData);
    httpMock.verify();
  });

  it('should check for error in load skip agency function when it is having error', fakeAsync(() => {
    let state = {
      pageOptions: {
        pageNumber: 0,
        pageSize: 10
      },
      projectId: '1'
    };
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));
    service.skipAgecnyLoad(state).subscribe({
      error: (error: any) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on get agencytypes api', () => {
    let testData = {
      'status': 200,
      'responseMessage': 'List retrieved successfully.',
      'data': [
        {
          'name': 'Technical',
          'description': 'Technical agency',
          'agencyTypeId': 1
        }
      ],
      'timestamp': '2023-06-05T10:03:06Z',
      'code': 'ps.master.commons.get.successful'
    };
    service.getAgencyTypes().subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + PROJECTS.allocateAgency.agencyTypes + `?serviceKey=${'masters/agencytype'}&userAction=${'view'}`;

    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in get agencytypes api', fakeAsync(() => {
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));
    service.getAgencyTypes().subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));
  it('should call on get agency names api', () => {
    let testData = {
      'status': 200,
      'message': 'List retrieved successfully.',
      'code': 'ps.commons.get.successful',
      'data': [
        {
          'agencyId': 1,
          'name': 'John'
        }
      ],
      'timestamp': '2023-03-29T09:46:07Z'
    };
    let projectId = '1';
    let id = 1;
    service.getAgencyNames(projectId, id).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    const requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.agencyNames, { projectId: projectId }) + `?serviceKey=${'masters/agency'}&userAction=${'view'}&agencyTypeId=${id}`;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in get agency names api', fakeAsync(() => {
    let projectId = '1';
    let id = 1;
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));
    service.getAgencyNames(projectId, id).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on get project documents api', () => {
    let testData = {
      'status': 200,
      'responseMessage': 'List retrieved successfully.',
      'data': {
        'content': [
          {
            'projectDocumentId': 1,
            'documentType': {
              'documentTypeId': 1,
              'name': 'docname 1'
            },
            'fileName': 'document1.pdf',
            'fromWhom': 'Ram',
            'inFavorOf': 'Sham'
          }
        ],
        'pageable': {
          'sort': {
            'empty': true,
            'unsorted': true,
            'sorted': false
          },
          'offset': 0,
          'pageNumber': 0,
          'pageSize': 10,
          'paged': true,
          'unpaged': false
        },
        'last': true,
        'totalElements': 15,
        'totalPages': 1,
        'size': 10,
        'number': 0,
        'sort': {
          'empty': true,
          'sorted': false,
          'unsorted': true
        },
        'first': true,
        'numberOfElements': 1,
        'empty': true
      },
      'code': 'ps.master.commons.get.successful',
      'timestamp': '2023-03-29T09:46:07Z'
    };
    let state = {
      projectId: '1',
      page: 0,
      pageSize: 10
    };
    service.getProjectDocuments(state, 1).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    const requestUrl: string = environment.apiUri + PROJECTS.allocateAgency.projectDocuments;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('POST');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in get project documents api', fakeAsync(() => {
    let state = {
      projectId: '1',
      page: 0,
      pageSize: 10
    };
    spyOn(restApiConnectorService, 'post').and.returnValue(throwError(() => ('error')));
    service.getProjectDocuments(state, 1).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on get project documents list api', () => {
    let testData = {
      'status': 200,
      'responseMessage': 'List retrieved successfully.',
      'data': {
        'content': [
          {
            'projectDocumentId': 1,
            'documentType': {
              'documentTypeId': 1,
              'name': 'docname 1'
            },
            'fileName': 'document1.pdf',
            'fromWhom': 'Ram',
            'inFavorOf': 'Sham'
          }
        ],
        'pageable': {
          'sort': {
            'empty': true,
            'unsorted': true,
            'sorted': false
          },
          'offset': 0,
          'pageNumber': 0,
          'pageSize': 10,
          'paged': true,
          'unpaged': false
        },
        'last': true,
        'totalElements': 15,
        'totalPages': 1,
        'size': 10,
        'number': 0,
        'sort': {
          'empty': true,
          'sorted': false,
          'unsorted': true
        },
        'first': true,
        'numberOfElements': 1,
        'empty': true
      },
      'code': 'ps.master.commons.get.successful',
      'timestamp': '2023-03-29T09:46:07Z'
    };
    let state = {
      projectId: '1',
      page: 0,
      pageSize: 10
    };
    service.getProjectDocumentsList(state, 1).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    const requestUrl: string = environment.apiUri + PROJECTS.allocateAgency.projectDocuments;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('POST');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in get project documents list api', fakeAsync(() => {
    let state = {
      projectId: '1',
      page: 0,
      pageSize: 10
    };
    spyOn(restApiConnectorService, 'post').and.returnValue(throwError(() => ('error')));
    service.getProjectDocumentsList(state, 1).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on delete allocate agency api', () => {
    let id = '1';
    let testData = {
      'status': 200,
      'responseMessage': 'Allocated Agency retrieved successfully.',
      'code': 'ps.project.get.allocateAgency.successful',
      'data': {
        'agency': {
          'agencyId': 1,
          'name': 'Agency 1'
        },
        'agencyType': {
          'agencyTypeId': 1,
          'name': 'Technical'
        },
        'agencyStatus': 'INITIALVERIFIFICATION',
        'agencyStatusDescription': 'Initial Verification',
        'allocateAgencyId': 1,
        'assignedDate': '2023-03-29T09:46:07Z'
      },
      'timestamp': '2023-03-29T09:46:07Z'
    };
    service.deleteAllocateAgency(id).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.viewDeleteAllocateAgency, { allocateAgencyId: id });
    requestUrl = requestUrl + `?projectId=${service.projectsCommonService.projectId}&serviceKey=project/agencyveri&userAction=${service.screenEntitlementCodes.tableActions.deleteAgency}&workflowCode=APF`;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(testData);
    httpMock.verify();
  });

  it('should call on view skip agency api', () => {
    let id = '1';
    let testData = {
      'status': 200,
      'responseMessage': 'Skipped Agency retrieved successfully.',
      'code': 'ps.project.get.skipAgency.successful',
      'data': {
        'skipAgencyId': 1,
        'remarks': 'This is for skip agency type.',
        'agencyType': {
          'agencyTypeId': 2,
          'name': 'Legal'
        }
      },
      'timestamp': '2023-03-29T09:46:07Z'
    };
    service.viewSkipAgency(id).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.viewSkipAgency, { skipAgencyId: id }) + `?serviceKey=${'project/agencyveri'}&userAction=${'VIEWSKIPAGNCY'}`;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in view skip agency function when it is having error', fakeAsync(() => {
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));
    let id = '1';
    service.viewSkipAgency(id).subscribe({
      error: (error: any) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on allocate agency api', () => {
    let state: any = {};
    let testData = {};
    service.allocateAgency(state).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + PROJECTS.allocateAgency.allocateAgency;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('POST');
    req.flush(testData);
    httpMock.verify();
  });

  it('should call on skip agency api', () => {
    let state: any = {};
    let testData = {};
    service.skipAgency(state).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + PROJECTS.allocateAgency.skipAgency;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('POST');
    req.flush(testData);
    httpMock.verify();
  });

  it('should call on reassign agency api', () => {
    let state: any = {};
    let testData = {};
    let id = 1;
    service.reassignAgency(state, id).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.reAssignAgency, { allocateAgencyId: 1 });
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('PUT');
    req.flush(testData);
    httpMock.verify();
  });

  it('should call on reopen agency api', () => {
    let state: any = {};
    let id = 1;
    let testData = {};
    service.reopenAgency(id).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.reopenAgency, { allocateAgencyId: 1 });
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('PUT');
    req.flush(testData);
    httpMock.verify();
  });

  it('should call on initial data entry api', () => {
    let state: any = {};
    let testData = {};
    service.initiateDataEntry(state).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + PROJECTS.allocateAgency.initiateDataEntry;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('POST');
    req.flush(testData);
    httpMock.verify();
  });

  it('should call on assign documents api', () => {
    let state: any = {};
    let testData = {};
    service.selectedDocuments(state).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + PROJECTS.allocateAgency.allocateAgency;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('POST');
    req.flush(testData);
    httpMock.verify();
  });

  it('should call on reassign documents api', () => {
    let state: any = {};
    let testData = {};
    let id = 1;
    service.selectedDocumentsForReassign(state, id).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.reAssignAgency, { allocateAgencyId: 1 });
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('PUT');
    req.flush(testData);
    httpMock.verify();
  });

  it('should call on update assign documents api', () => {
    let state: any = {};
    let testData = {};
    let id = 1;
    service.updateSelectedDocuments(state, id).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.viewUpdateAssignDocuments, { allocateAgencyId: 1 });
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('PUT');
    req.flush(testData);
    httpMock.verify();
  });

  it('should call on view DocumentsList api', () => {
    let id = '1';
    let testData = {
      'status': 200,
      'responseMessage': 'List retrieved successfully.',
      'code': 'ps.commons.get.successful',
      'data': [
        {
          'projectDocumentId': 3,
          'documentType': 'document1',
          'fileName': 'document1.pdf',
          'fromWhom': 'Ram',
          'inFavorOf': 'Sham'
        },
        {
          'projectDocumentId': 5,
          'documentType': 'document2',
          'fileName': 'document2.pdf',
          'fromWhom': 'Sham',
          'inFavorOf': 'Ram'
        }
      ]
    };
    service.getUpdateDocumentsList(id).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.viewUpdateAssignDocuments, { allocateAgencyId: 1 }) + `?serviceKey=${'project/agencyveri'}&userAction=${'ASSIGNDOCAGENCY'}`;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in view DocumentsList when it is having error', fakeAsync(() => {
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));
    let id = '1';
    service.getUpdateDocumentsList(id).subscribe({
      error: (error: any) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('Call an generatePayloadForAssignAgency payload method', fakeAsync(() => {
    let formData = {
      agencyName: 4,
      agencyType: 1
    };
    spyOn(service, 'generatePayloadForAssignAgency').and.callThrough();
    service.generatePayloadForAssignAgency(formData, 'ASSIGN');
  }));

  it('Call an generatePayloadForSkipAgency payload method', fakeAsync(() => {
    let formData = {
      projectId: 4,
      agencyType: 1,
      remarks: 'ABCD'
    };
    spyOn(service, 'generatePayloadForSkipAgency').and.callThrough();
    service.generatePayloadForSkipAgency(formData);
  }));

  it('Call an generatePayloadForAssignDocuments payload method', fakeAsync(() => {
    let formData = [
      {
        'fromWhom': 'SHAM',
        'inFavorOf': 'RAM',
        'projectStepCode': 'FIle 8',
        'uploadedBy': 'sham',
        'documentType': {
          'name': 'part agreement',
          'documentTypeId': 1
        },
        'projectDocumentId': 11,
        'fileName': 'FGT'
      }
    ];
    spyOn(service, 'generatePayloadForAssignDocuments').and.callThrough();
    service.generatePayloadForAssignDocuments(formData);
  }));

  it('should call on download document api', () => {
    let id: any = '1';
    service.downloadDocument(id).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    const requestUrl: string = localeFormatterService.format(environment.apiUri + PROJECTS.uploadReport.download, { fileId: id }) + `?serviceKey=${'project/agencyveri'}&userAction=${'DOWLDRPRT'}`;

    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    let response = new Blob();
    req.flush(response);
    httpMock.verify();
  });

  it('should check for error in download document function when it is having error', fakeAsync(() => {
    let id: any = '1';
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));

    service.downloadDocument(id).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on viewAgencyDownloadDocumentsDetails  list api', () => {
    let loadTestData = {
      status: 200,
      responseMessage: 'List retrieved successfully.',
      data: {
        content: [
          {
            uploadDate: '2023-08-03T12:19:59',
            filePath: '6/UPLDAGNCYUPDREPDOC/',
            fileServiceIdentifier: 6,
            projectDocumentId: 3,
            fileName: 'PS_Style_Guide_v0.8.pdf'
          }
        ],
        pageable: {
          sort: {
            empty: false,
            sorted: true,
            unsorted: false
          },
          offset: 0,
          pageNumber: 0,
          pageSize: 2147483647,
          paged: true,
          unpaged: false
        },
        totalElements: 1,
        totalPages: 1,
        last: true,
        size: 2147483647,
        number: 0,
        sort: {
          empty: false,
          sorted: true,
          unsorted: false
        },
        numberOfElements: 1,
        first: true,
        empty: false
      },
      timestamp: '2023-08-04T09:28:07Z',
      code: 'ps.master.commons.get.successful'
    };
    let state = {
      pageOptions: {
        pageNumber: 0,
        pageSize: 10
      },
      projectId: '1'
    };
    service.viewAgencyDownloadDocumentsDetails(state).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    const requestUrl: string = environment.apiUri + PROJECTS.allocateAgency.viewAgencyDownloadDocuments;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('POST');
    req.flush(loadTestData);
    httpMock.verify();
  });

  it('should check for error in load allocate agency when it is having error', fakeAsync(() => {
    let state = {
      pageOptions: {
        pageNumber: 0,
        pageSize: 10
      },
      projectId: '1'
    };
    spyOn(restApiConnectorService, 'post').and.returnValue(throwError(() => ('error')));
    service.viewAgencyDownloadDocumentsDetails(state).subscribe({
      error: (error: any) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should set and get agency data', () => {
    const agencyData = { id: 1, name: 'Example Agency' };
    service.setAgency(agencyData);
    const retrievedAgency = service.getAgency();
    expect(retrievedAgency).toEqual(agencyData);
  });

  it('should call on view viewAgencyReportsDetails api', () => {
    let id = '1';
    let testData = {
      status: 200,
      responseMessage: 'List retrieved successfully.',
      data: {
        agencyReport: {
          uploadDate: '2023-08-03T12:20:28',
          filePath: '6/UPLDAGNCYUPDREP/',
          remarks: 'sadad',
          fileServiceIdentifier: 7,
          feedBack: 'Positive',
          projectDocumentId: 3,
          fileName: 'PS_Data Entry_Disbursement Documents_v0.3.pdf'
        },
        allocateAgencyId: 5
      },
      timestamp: '2023-08-04T09:44:48Z',
      code: 'ps.master.commons.get.successful'
    };
    service.viewAgencyReportsDetails(id).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.viewAgencyReport, { agencyid: id }) + `?serviceKey=${'project/agencyveri'}&userAction=${'VIEWAGNCYREP'}`;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in view viewAgencyReportsDetails when it is having error', fakeAsync(() => {
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));
    let id = '1';
    service.viewAgencyReportsDetails(id).subscribe({
      error: (error: any) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on view viewAgencyReportsList api', () => {
    let id = '1';
    let testData = {
      status: 200,
      responseMessage: 'List retrieved successfully.',
      data: {
        agencyReport: {
          uploadDate: '2023-08-03T12:20:28',
          filePath: '6/UPLDAGNCYUPDREP/',
          remarks: 'sadad',
          fileServiceIdentifier: 7,
          feedBack: 'Positive',
          projectDocumentId: 3,
          fileName: 'PS_Data Entry_Disbursement Documents_v0.3.pdf'
        },
        allocateAgencyId: 5
      },
      timestamp: '2023-08-04T09:44:48Z',
      code: 'ps.master.commons.get.successful'
    };
    service.viewAgencyReportsList(id).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.viewAgencyReport, { agencyid: id }) + `?serviceKey=${'masters/agencytype'}&userAction=${'view'}`;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in view viewAgencyReportsList when it is having error', fakeAsync(() => {
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));
    let id = '1';
    service.viewAgencyReportsList(id).subscribe({
      error: (error: any) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('Call setAgency method', fakeAsync(() => {
    let formData = {
      projectId: 4,
      agencyType: 1,
      remarks: 'ABCD'
    };
    spyOn(service, 'setAgency').and.callThrough();
    service.setAgency(formData);
    expect(service.agencyData).toBe(formData);
  }));

  it('Call getAgency method', fakeAsync(() => {
    spyOn(service, 'getAgency').and.callThrough();
    service.getAgency();
    expect(service.getAgency).toHaveBeenCalled();
  }));

  it('Call generateInitiateDataEntryPayload method', fakeAsync(() => {
    spyOn(service, 'generateInitiateDataEntryPayload').and.callThrough();
    service.generateInitiateDataEntryPayload({});
    expect(service.generateInitiateDataEntryPayload).toHaveBeenCalled();
  }));

  /** IIFL START */
  it('should call on getUserRole api', () => {

    service.getUserRole().subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + PROJECTS.iiflLegalManager.role + '?serviceKey=masters/role&userAction=view&visibility=YES&roleId=7';
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in getUserRole function when it is having error', fakeAsync(() => {
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));

    service.getUserRole().subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on assignLegalManager api', () => {
    let payload = {};
    service.assignLegalManager(payload).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + PROJECTS.iiflLegalManager.assignLegalManager;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('POST');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in assignLegalManager function when it is having error', fakeAsync(() => {
    let payload = {};
    spyOn(restApiConnectorService, 'post').and.returnValue(throwError(() => ('error')));

    service.assignLegalManager(payload).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on loadLegalManager api', () => {
    service.projectsCommonService.projectId = 1;
    let payload = {};
    service.loadLegalManager(payload).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.iiflLegalManager.legalManagerAssignedList, { projectId: 1 }) + '?serviceKey=project/agencyveri&userAction=VIEWLEGALMANAGER';
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in loadLegalManager function when it is having error', fakeAsync(() => {
    let payload = {};
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));

    service.loadLegalManager(payload).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on tmLoad api', () => {
    let testData = {
      data: {
        totalElements: 1,
        content: [
          {
            user: {
              userId: 1,
              firstName: 'joe',
              lastName: 'root',
              userRole: {
                roleName: 'Sales',
                roleId: 6
              }
            },
            allocateAgencyId: 1,
            agencyStatusDescription: 'Completed',
            assignedDate: '',
            actions: []
          }
        ]
      }
    };
    let payload = {};
    service.tmLoad(payload).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.iiflAllocateAgency.tmAssignedList, { projectId: 1 });
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('POST');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in tmLoad function when it is having error', fakeAsync(() => {
    let payload = {};
    spyOn(restApiConnectorService, 'post').and.returnValue(throwError(() => ('error')));

    service.tmLoad(payload).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on deleteAssignedLegalManager api', () => {
    let id = '';
    service.deleteAssignedLegalManager(id).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.iiflLegalManager.deleteAssignedLegalManager, { allocateAgencyId: id }) + '?projectId=&serviceKey=project/agencyveri&userAction=DELLEGALMANAGER&workflowCode=APF';
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in deleteAssignedLegalManager function when it is having error', fakeAsync(() => {
    let id = '';
    spyOn(restApiConnectorService, 'delete').and.returnValue(throwError(() => ('error')));

    service.deleteAssignedLegalManager(id).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on deleteAssignedTm api', () => {
    let id = '';
    service.deleteAssignedTm(id).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.iiflAllocateAgency.deleteTm, { allocateAgencyId: id }) + '?projectId=&serviceKey=project/agencyveri&userAction=DELTECHMANAGER&workflowCode=APF';
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in deleteAssignedTm function when it is having error', fakeAsync(() => {
    let id = '';
    spyOn(restApiConnectorService, 'delete').and.returnValue(throwError(() => ('error')));

    service.deleteAssignedTm(id).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should check for error in getTmNameList function when it is having error', fakeAsync(() => {
    let id = '1';
    spyOn(restApiConnectorService, 'post').and.returnValue(throwError(() => ('error')));

    service.userNameList(id, 1, '').subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on getskipAgencyTypes api', () => {
    service.projectsCommonService.projectId = 1;
    service.getskipAgencyTypes().subscribe(response => {
      expect(response).toBeTruthy();
    });
    const requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.iiflSkipAgency.skipAgencyTypeList, { projectId: 1 }) + ProjAuthorizationConstants.agency.agencytype;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in getskipAgencyTypes function when it is having error', fakeAsync(() => {
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));

    service.getskipAgencyTypes().subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on assignTm api', () => {
    let data = {};
    service.assignTm(data).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + PROJECTS.iiflAllocateAgency.assignTm;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('POST');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in assignTm function when it is having error', fakeAsync(() => {
    let data = {};
    spyOn(restApiConnectorService, 'post').and.returnValue(throwError(() => ('error')));

    service.assignTm(data).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on reAssignTm api', () => {
    let data = {};
    let id = '';
    service.reAssignTm(data, id).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.iiflAllocateAgency.reAssignTm, { allocateAgencyId: id });
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('PUT');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in reAssignTm function when it is having error', fakeAsync(() => {
    let data = {};
    let id = '';
    spyOn(restApiConnectorService, 'put').and.returnValue(throwError(() => ('error')));

    service.reAssignTm(data, id).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on reAssignLegalManager api', () => {
    let data = {};
    let id = 1;
    service.reAssignLegalManager(data, id).subscribe(response => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.iiflLegalManager.reAssignLegalManager, { allocateAgencyId: 1 });
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('PUT');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in reAssignLegalManager function when it is having error', fakeAsync(() => {
    let data = {};
    let id = '';
    spyOn(restApiConnectorService, 'put').and.returnValue(throwError(() => ('error')));

    service.reAssignLegalManager(data, id).subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on view previousAgencyReportsDetails api', () => {
    let id = '1';
    let testData = {
      status: 200,
      responseMessage: 'List retrieved successfully.',
      data: {
        agencyReport: {
          uploadDate: '2023-08-03T12:20:28',
          filePath: '6/UPLDAGNCYUPDREP/',
          remarks: 'sadad',
          fileServiceIdentifier: 7,
          feedBack: 'Positive',
          projectDocumentId: 3,
          fileName: 'PS_Data Entry_Disbursement Documents_v0.3.pdf'
        },
        allocateAgencyId: 5
      },
      timestamp: '2023-08-04T09:44:48Z',
      code: 'ps.master.commons.get.successful'
    };
    service.previousAgencyReportsDetails(id).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.previousAgencyReport, { previousreportId: id }) + `?serviceKey=${'project/agencyveri'}&userAction=${'VIEWAGNCYREP'}`;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in view previousAgencyReportsDetails when it is having error', fakeAsync(() => {
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));
    let id = '1';
    service.previousAgencyReportsDetails(id).subscribe({
      error: (error: any) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on view previousReportsList api', () => {
    let id = '1';
    let testData = {
      status: 200,
      responseMessage: 'List retrieved successfully.',
      data: {
        agencyReport: {
          uploadDate: '2023-08-03T12:20:28',
          filePath: '6/UPLDAGNCYUPDREP/',
          remarks: 'sadad',
          fileServiceIdentifier: 7,
          feedBack: 'Positive',
          projectDocumentId: 3,
          fileName: 'PS_Data Entry_Disbursement Documents_v0.3.pdf'
        },
        allocateAgencyId: 5
      },
      timestamp: '2023-08-04T09:44:48Z',
      code: 'ps.master.commons.get.successful'
    };
    service.previousReportsList(id).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.previousAgencyReport, { previousreportId: id }) + `?serviceKey=${'masters/agencytype'}&userAction=${'view'}`;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in view previousReportsList when it is having error', fakeAsync(() => {
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));
    let id = '1';
    service.previousReportsList(id).subscribe({
      error: (error: any) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on previousDownloadDocumentsDetails  list api', () => {
    let loadTestData = {
      status: 200,
      responseMessage: 'List retrieved successfully.',
      data: {
        content: [
          {
            uploadDate: '2023-08-03T12:19:59',
            filePath: '6/UPLDAGNCYUPDREPDOC/',
            fileServiceIdentifier: 6,
            projectDocumentId: 3,
            fileName: 'PS_Style_Guide_v0.8.pdf'
          }
        ],
        pageable: {
          sort: {
            empty: false,
            sorted: true,
            unsorted: false
          },
          offset: 0,
          pageNumber: 0,
          pageSize: 2147483647,
          paged: true,
          unpaged: false
        },
        totalElements: 1,
        totalPages: 1,
        last: true,
        size: 2147483647,
        number: 0,
        sort: {
          empty: false,
          sorted: true,
          unsorted: false
        },
        numberOfElements: 1,
        first: true,
        empty: false
      },
      timestamp: '2023-08-04T09:28:07Z',
      code: 'ps.master.commons.get.successful'
    };
    let state = {
      pageOptions: {
        pageNumber: 0,
        pageSize: 10
      },
      projectId: '1'
    };
    service.previousDownloadDocumentsDetails(state).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    const requestUrl: string = environment.apiUri + PROJECTS.allocateAgency.previousDownloadDocuments;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('POST');
    req.flush(loadTestData);
    httpMock.verify();
  });

  it('should check for error in previousDownloadDocumentsDetailswhen it is having error', fakeAsync(() => {
    let state = {
      pageOptions: {
        pageNumber: 0,
        pageSize: 10
      },
      projectId: '1'
    };
    spyOn(restApiConnectorService, 'post').and.returnValue(throwError(() => ('error')));
    service.previousDownloadDocumentsDetails(state).subscribe({
      error: (error: any) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on view viewSiteVisitPhotographsList api', () => {
    let id = '1';
    let testData = {
      status: 200,
      responseMessage: 'List retrieved successfully.',
      data: {
        agencyReport: {
          uploadDate: '2023-08-03T12:20:28',
          filePath: '6/UPLDAGNCYUPDREP/',
          remarks: 'sadad',
          fileServiceIdentifier: 7,
          feedBack: 'Positive',
          projectDocumentId: 3,
          fileName: 'PS_Data Entry_Disbursement Documents_v0.3.pdf'
        },
        allocateAgencyId: 5
      },
      timestamp: '2023-08-04T09:44:48Z',
      code: 'ps.master.commons.get.successful'
    };
    service.viewSiteVisitPhotographsList(id).subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + localeFormatterService.format(PROJECTS.allocateAgency.viewAgencyReport, { agencyid: id }) + `?serviceKey=${'masters/agencytype'}&userAction=${'view'}`;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in view viewSiteVisitPhotographsList when it is having error', fakeAsync(() => {
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));
    let id = '1';
    service.viewSiteVisitPhotographsList(id).subscribe({
      error: (error: any) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  it('should call on view getUserRolesList api', () => {
    let testData = {
      data: [
        {
          roleId: 6,
          roleName: 'Sales'
        }
      ]
    };
    service.getUserRolesList().subscribe((response: any) => {
      expect(response).toBeTruthy();
    });
    let requestUrl: string = environment.apiUri + PROJECTS.iiflAllocateAgency.userRoles + `?isPrePostPseudoRole=${'YES'}&serviceKey=${'masters/user'}&userAction=${'view'}`;
    const req = httpMock.expectOne(
      requestUrl
    );
    expect(req.request.method).toBe('GET');
    req.flush(testData);
    httpMock.verify();
  });

  it('should check for error in view getUserRolesList when it is having error', fakeAsync(() => {
    spyOn(restApiConnectorService, 'get').and.returnValue(throwError(() => ('error')));
    let id = '1';
    service.getUserRolesList().subscribe({
      error: (error: any) => {
        expect(error).toBeTruthy();
      }
    });
    tick();
  }));

  /** IIFL END */
});
