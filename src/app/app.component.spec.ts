import { TestBed, ComponentFixture } from '@angular/core/testing'; // Import ComponentFixture
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it(`should have the 'CineVault-Angular-client' title`, () => {
    expect(app.title).toEqual('CineVault-Angular-client');
  });

  it('should render the correct title in the header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // Check if the <h1> contains the title text correctly
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome to CineVault!');
  });

  it('should render the title dynamically', () => {
    // Check the title rendered dynamically in the HTML
    const h1 = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(h1.textContent).toContain('Welcome to CineVault!');
  });
});
