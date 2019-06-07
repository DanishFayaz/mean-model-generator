import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable()
export class NotificationsService {
  constructor(private toaster: ToastrService) {}

  notify(title, message, type) {
    this.toaster.show(message, title, null, type);
  }
}
