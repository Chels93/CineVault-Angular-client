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
    // Create a mock MatDialog object
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [WelcomePageComponent, UserLoginComponent, UserRegistrationComponent],
      imports: [MatDialogModule], // Ensure MatDialogModule is imported here
      providers: [{ provide: MatDialog, useValue: dialogSpy }] // Mock MatDialog
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open UserRegistrationComponent dialog', () => {
    // Configure the spy to return an observable when open is called
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);

    component.openUserRegistrationDialog();
    expect(dialogSpy.open).toHaveBeenCalledWith(UserRegistrationComponent, {
      width: '280px',
      disableClose: true,
    });
  });

  it('should open UserLoginComponent dialog', () => {
    dialogSpy.open.and.returnValue({ afterClosed: () => of(true) } as any);

    component.openUserLoginDialog();
    expect(dialogSpy.open).toHaveBeenCalledWith(UserLoginComponent, {
      width: '280px',
      disableClose: true,
    });
  });
});
