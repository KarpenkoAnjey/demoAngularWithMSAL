import { Component, OnInit } from '@angular/core';
import { ClientListService } from '../../services/client-list.service';
import { ClientListClientContract } from '../../contracts/clientListContract';
import { Auth2Service } from "../../../services/auth2.service";

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss'
})
export class ClientListComponent implements OnInit  {
  clients:ClientListClientContract[] = [];
  constructor(private clientsService: ClientListService, private auth: Auth2Service){}

  ngOnInit(): void {
    this.auth.onAuthState().subscribe((e)=>{
        if (e) {
          this.getClients();
        }
        if (!e) {
          this.clients = [];
        }
    })
  }
  getClients(){
    const x =  this.clientsService.get(1);
    x.subscribe((r)=>{
      this.clients = r?.clients ?? [];
      console.log(r);
    } );
  }
}
