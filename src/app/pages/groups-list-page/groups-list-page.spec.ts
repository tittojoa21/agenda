import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsListPage } from './groups-list-page';

describe('GroupsListPage', () => {
  let component: GroupsListPage;
  let fixture: ComponentFixture<GroupsListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
