import { Component, OnInit,ViewChild } from '@angular/core';
import { ServerService } from '../service/server.service';
import { NavController,Platform,LoadingController,IonSlides,Events,AlertController,ToastController } from '@ionic/angular';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
	
  data:any;
  text:any;
  store:any;
  complete:any;
  pet:number = 1;
  overview:any;
  intr:any;

  constructor(public toastController: ToastController, private audio: NativeAudio,
    private platform: Platform, public alertController: AlertController,public server : ServerService,private nav: NavController,public events: Events,public loadingController : LoadingController)
  {
    this.intr = setInterval(() => {      
        
      this.loadData();

    },60000); 
  }

  ionViewWillEnter()
  {
    if(localStorage.getItem('app_text') && localStorage.getItem('app_text') != undefined)
    {
      this.text = JSON.parse(localStorage.getItem('app_text'));
    }

    this.loadData();
  }

  ngOnInit()
  {
    
  }
  ngAfterViewInit(){
    if (this.platform.ready())
    this.audio.preloadSimple('newOrder', 'assets/ringtones/notify.mpeg');
   

  }
  async loadData()
  {
    const loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await loading.present();

    this.server.homepage(localStorage.getItem('user_id'),0).subscribe((response:any) => {
    let oldId = (this.data && this.data[0]) ? this.data[0].id : -1
      this.data = response.data;
    
    this.store     = response.store;
    this.text      = response.text;
    this.overview  = response.overview;
    this.complete  = response.complete;
     console.log(oldId);
     console.log(this.data[0].id);
  
    if (oldId != -1 && oldId != this.data[0].id) {
      console.log("ehhh");
      if(this.platform.is('cordova')){
        this.audio.loop('newOrder');
        setTimeout(()=>{
          this.audio.stop('newOrder')
        },20000);
        

      }
      this.presentToast('New Order Received')

    }
    this.events.publish('text', this.text);
    this.events.publish('admin', response.admin);

    localStorage.setItem('dboy', JSON.stringify(response.dboy));
    localStorage.setItem('app_text', JSON.stringify(response.text));
    localStorage.setItem('store_data', JSON.stringify(response.store));
    localStorage.setItem('admin_data', JSON.stringify(response.admin));
    localStorage.setItem('app_type', response.app_type);

    loading.dismiss();

    });
  }


  async presentToast(txt) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 3000,
      position : 'top',
      mode:'ios',
      color:'dark',
      buttons: [
        {
          text: 'Accept',
          handler: () => {
            console.log('Favorite clicked');
             this.audio.stop('newOrder')
          }
        }
      ]
    });
    toast.present();
  }

  detail(odata)
  {
    clearInterval(this.intr);
    
    localStorage.setItem('odata', JSON.stringify(odata));

    this.nav.navigateForward('/detail');
  }
}
