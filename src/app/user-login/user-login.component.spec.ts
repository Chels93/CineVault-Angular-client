import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserLoginComponent } from './user-login.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FetchApiDataService } from '../fetch-api-data.service';
import { of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

describe('UserLoginComponent', () => {
  let component: UserLoginComponent;
  let fixture: ComponentFixture<UserLoginComponent>;
  let fetchApiDataService: jasmine.SpyObj<FetchApiDataService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<UserLoginComponent>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    fetchApiDataService = jasmine.createSpyObj('FetchApiDataService', ['userLogin']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [UserLoginComponent],
      imports: [
        MatDialogModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        MatCardModule,
        FormsModule,
        MatButtonModule,
      ],
      providers: [
        { provide: FetchApiDataService, useValue: fetchApiDataService },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call userLogin and show success message on successful login', () => {
    const mockResponse = {
      user: { username: 'testuser', id: '123' },
      token: 'mock-token',
    };

    fetchApiDataService.userLogin.and.returnValue(of(mockResponse));

    component.loginForm.setValue({ username: 'testuser', password: 'password' });
    component.logInUser();

    expect(fetchApiDataService.userLogin).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Login success, Welcome testuser',
      'OK',
      { duration: 2000 }
    );
    expect(router.navigate).toHaveBeenCalledWith(['/movies']);
  });

  it('should call logOutUser and clear localStorage on logout', () => {
    spyOn(localStorage, 'removeItem');
    component.logOutUser();
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Logged out successfully',
      'OK',
      { duration: 2000 }
    );
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
