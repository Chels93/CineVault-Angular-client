import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomePageComponent } from './welcome-page.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserLoginComponent } from '../user-login/user-login.component';
import { UserRegistrationComponent } from '../user-registration/user-registration.component';
import { of } from 'rxjs';

describe('WelcomePageComponent', () => {
  let component: WelcomePageComponent;
  let fixture: ComponentFixture<WelcomePageComponent>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    // Create a spy object for MatDialog with a mock 'open' method
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [
        WelcomePageComponent,
        UserLoginComponent,
        UserRegistrationComponent,
      ],
      imports: [MatDialogModule], // Ensure MatDialogModule is imported here
      providers: [{ provide: MatDialog, useValue: dialogSpy }], // Provide the mocked MatDialog object instead of the actual one
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomePageComponent);
    component = fixture.componentInstance; // Get the component instance from the fixture
    fixture.detectChanges(); // Trigger change detection to initialize the component
  });

  it('should create', () => {
    expect(component).toBeTruthy(); // Ensure the component is created successfully
  });

  it('should open UserRegistrationComponent dialog', () => {
    // Configure the spy to return a mock observable when open is called
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);

    // Call the method that opens the UserRegistrationComponent dialog
    component.openSignupDialog();

    // Assert that the dialog was opened with the correct component and options
    expect(dialogSpy.open).toHaveBeenCalledWith(UserRegistrationComponent, {
      width: '280px', // Specify the dialog width
      disableClose: true, // Ensure the dialog cannot be closed by clicking outside
    });
  });

  it('should open UserLoginComponent dialog', () => {
    // Configure the spy to return a mock observable when open is called
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);

    // Call the method that opens the UserLoginComponent dialog
    component.openLoginDialog();

    // Assert that the dialog was opened with the correct component and options
    expect(dialogSpy.open).toHaveBeenCalledWith(UserLoginComponent, {
      width: '280px', // Specify the dialog width
      disableClose: true, // Ensure the dialog cannot be closed by clicking outside
    });
  });
});