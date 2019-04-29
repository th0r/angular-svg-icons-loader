import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-svg-icon',
  templateUrl: './svg-icon.component.html',
  styleUrls: ['./svg-icon.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgIconComponent {
  @Input() iconId: string;
  @Input() size?: number;
  @Input() width?: number;
  @Input() height?: number;
}
