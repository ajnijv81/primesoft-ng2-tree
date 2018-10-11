import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { NodeMenuService } from './node-menu.service';
import { NodeMenuAction, NodeMenuItemAction, NodeMenuItemSelectedEvent } from './menu.events';
import { isEscapePressed, isLeftButtonClicked } from '../utils/event.utils';

@Component({
  selector: 'node-menu',
  template: `
  <div class="node-menu" >
  <ul *ngIf="itemType == 'node-leaf'" class="node-menu-content" #menuContainer>
    <li class="node-menu-item" *ngFor="let menuItem of availableFileMenuItems"
          (click)="onMenuItemSelected($event, menuItem)">
          <div>
            <div class="node-menu-item-icon {{menuItem.cssClass}}"></div>
            <span  class="node-menu-item-value">{{menuItem.name}}</span>
          </div>
        </li>
      </ul>
      <ul *ngIf="itemType != 'node-leaf'" class="node-menu-content" #menuContainer>
      <li class="node-menu-item" *ngFor="let menuItem of getEligibleMenuItems()"
        (click)="onMenuItemSelected($event, menuItem)" ngClass="{ 'active': false}">
        <div>
         <div class="node-menu-item-icon {{menuItem.cssClass}}"></div>
          <span  class="node-menu-item-value">{{menuItem.name}}</span>
    </div>
    </li>
    </ul>
      </div>
    `,
    styles: [
            ``
            ]
})

export class NodeMenuComponent implements OnInit, OnDestroy {
  @Output()
  public menuItemSelected: EventEmitter<NodeMenuItemSelectedEvent> = new EventEmitter<NodeMenuItemSelectedEvent>();
  
  @Input() public itemType: string;
  @Input() public menuItems: NodeMenuItem[];

  @ViewChild('menuContainer') public menuContainer: any;
  getEligibleMenuItems = () => {
    return this.availableMenuItems.filter(i => i.display == true)
  }

  public availableFileMenuItems: NodeMenuItem[] = [
    {
      name: 'File Menu',
      action: NodeMenuItemAction.NewTag,
      cssClass: 'new-tag'
    }
  ];
 

  public availableMenuItems: NodeMenuItem[] = [
    {
      name: 'New tag',
      action: NodeMenuItemAction.NewTag,
      cssClass: 'new-tag'
    },
    {
      name: 'New folder',
      action: NodeMenuItemAction.NewFolder,
      cssClass: 'new-folder'
    },
    {
      name: 'Rename',
      action: NodeMenuItemAction.Rename,
      cssClass: 'rename'
    },
    {
      name: 'Remove',
      action: NodeMenuItemAction.Remove,
      cssClass: 'remove'
    },
    {
      name: 'Move',
      action: NodeMenuItemAction.Move,
      cssClass: 'move'
    }
  ];

  private disposersForGlobalListeners: Function[] = [];

  public constructor(
    @Inject(Renderer2) private renderer: Renderer2,
    @Inject(NodeMenuService) private nodeMenuService: NodeMenuService
  ) {}

  public ngOnInit(): void {
    this.availableMenuItems = this.menuItems || this.availableMenuItems;
    this.disposersForGlobalListeners.push(this.renderer.listen('document', 'keyup', this.closeMenu.bind(this)));
    this.disposersForGlobalListeners.push(this.renderer.listen('document', 'mousedown', this.closeMenu.bind(this)));
  }

  public ngOnDestroy(): void {
    this.disposersForGlobalListeners.forEach((dispose: Function) => dispose());
  }

  public onMenuItemSelected(e: MouseEvent, selectedMenuItem: NodeMenuItem): void {
    if (isLeftButtonClicked(e)) {
      this.menuItemSelected.emit({
        nodeMenuItemAction: selectedMenuItem.action,
        nodeMenuItemSelected: selectedMenuItem.name
      });

      this.nodeMenuService.fireMenuEvent(e.target as HTMLElement, NodeMenuAction.Close);
    }
  }

  private closeMenu(e: MouseEvent | KeyboardEvent): void {
    const mouseClicked = e instanceof MouseEvent;
    // Check if the click is fired on an element inside a menu
    const containingTarget =
      this.menuContainer.nativeElement !== e.target && this.menuContainer.nativeElement.contains(e.target);

    if ((mouseClicked && !containingTarget) || isEscapePressed(e as KeyboardEvent)) {
      this.nodeMenuService.fireMenuEvent(e.target as HTMLElement, NodeMenuAction.Close);
    }
  }
}

export interface NodeMenuItem {
  name: string;
  action: NodeMenuItemAction;
  display?: boolean;
  cssClass?: string
}
