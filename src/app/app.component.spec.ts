import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(async () => {
    // Configure the testing module before each test
    await TestBed.configureTestingModule({
      imports: [AppComponent], // Import the AppComponent module to be tested
    }).compileComponents(); // Compile the components to prepare them for testing

    fixture = TestBed.createComponent(AppComponent); // Create a fixture instance for AppComponent
    app = fixture.componentInstance; // Get the component instance from the fixture
    fixture.detectChanges(); // Detect changes in the component (trigger change detection)
  });

  // Test 1: Verify if the app component is created successfully
  it('should create the app', () => {
    expect(app).toBeTruthy(); // Assert that the app component instance is truthy (i.e., it was created successfully)
  });

  // Test 2: Check if the title property of the component is set correctly
  it(`should have the 'CineVault-Angular-client' title`, () => {
    expect(app.title).toEqual('CineVault-Angular-client'); // Assert that the title property matches the expected value
  });

  // Test 3: Verify that the title is rendered correctly in the <h1> element of the component
  it('should render the correct title in the header', () => {
    const compiled = fixture.nativeElement as HTMLElement; // Access the native DOM element of the component
    // Check if the <h1> element contains the correct title text
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Welcome to CineVault!'
    );
  });

  // Test 4: Dynamically check if the title is rendered correctly in the HTML
  it('should render the title dynamically', () => {
    const h1 = fixture.debugElement.query(By.css('h1')).nativeElement; // Query the <h1> element using DebugElement
    expect(h1.textContent).toContain('Welcome to CineVault!'); // Assert that the <h1> contains the expected title text
  });
});
