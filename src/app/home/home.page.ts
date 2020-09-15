import { Component, ViewChild} from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { createAnimation } from '@ionic/core';
import { HTTP } from '@ionic-native/http/ngx';
import { ToastController } from '@ionic/angular';
import { Badge } from '@ionic-native/badge/ngx';

declare var MusicControls: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  slideOpts = {
    spaceBetween: 0,
    slidesPerView: 3,
    autoplay: true,
    speed :1000
  };

  upcoming:any[] = []
  recent:any[] = []
  radioUrl: any = 'https://streamingv2.shoutcast.com/raddiotalky';
  name: string;
  img1: any;
  img2: any
  img3: any;
  img4: any;
  img5: any;
  currentShowIndex = null;
  title: string = "Listen Now";
  upcomingLoading: boolean = true;
  recentLoading: boolean = true;
  firstTime: boolean = true;
  radioClicked: boolean = false;
  showClicked: boolean = false;

  @ViewChild('radioPlayer') radio: any;
  @ViewChild('showPlayer') show: any;
 
  isRadioPlaying : boolean = false;
  isShowPlaying : boolean = false;
  btnImage: any = '../../assets/play.png';
  show_playImg: any = '../../assets/Playmark_white2.png';
  show_pauseImg: any = '../../assets/pausemark_white2.png';
  animation = createAnimation();

  constructor(private network: Network, private http: HTTP, private badge: Badge, private toastController: ToastController) 
  { 

    this.network.onDisconnect().subscribe(() => {
      if (this.isRadioPlaying ==true) {
        this.radio.nativeElement.pause();
        this.radio.nativeElement.src = null;
        this.btnImage = '../../assets/play.png';
        document.getElementById('buttonImage').setAttribute( 'src', this.btnImage);
        this.stopAnimation();  
        MusicControls.updateIsPlaying(false); 
      }
  
      if (this.isShowPlaying == true ) {
        this.show.nativeElement.pause();
        this.stopAnimation();
      }
      alert("Please Check the Internet Connection");
    });

    this.network.onConnect().subscribe(() => {
      if (this.upcomingLoading == true) {
        this.upcomingShows();
      }

      if (this.recentLoading == true) {
        this.recentShows();
      }

      if (this.isRadioPlaying == true && this.radio.nativeElement.paused == true) {
        this.radio.nativeElement.src = this.radioUrl;
        this.radio.nativeElement.autobuffer = true;
        this.radio.nativeElement.load();
        this.radio.nativeElement.play();
        this.btnImage = '../../assets/stop.png';
        document.getElementById('buttonImage').setAttribute( 'src', this.btnImage);
        this.playAnimation();
        MusicControls.updateIsPlaying(true); 
      }

      if (this.isShowPlaying == true && this.show.nativeElement.ended == false && this.show.nativeElement.paused == true) {
        this.show.nativeElement.play();
        this.playAnimation();
      }
    });

    this.upcomingShows();
    this.recentShows();
    this.badge.clear();
  }

  music()
  {
    //music controls on notification bar
    MusicControls.create(
      {
        track: this.title,
        cover: 'assets/logo.png',

        isPlaying   : false,					
	      dismissable : true,

        hasPrev   : false,
        hasNext   : false,	
        hasClose  : false,

      }
    )
    
    MusicControls.listen();

    // Register callback
    MusicControls.subscribe((action) => {
      const message = JSON.parse(action).message;
      switch(message) {
        case 'music-controls-pause':
          if (this.radioClicked == true) {
            this.playRadio();
          } else if (this.showClicked == true) {
            this.playShow(this.recent[this.currentShowIndex], this.currentShowIndex);
          }
          break;
        case 'music-controls-play':
          if (this.radioClicked == true) {
            this.playRadio();
          } else if (this.showClicked == true) {
            this.playShow(this.recent[this.currentShowIndex], this.currentShowIndex);
          }
          break;
        case 'music-controls-destroy':
          // this.exit();
          break;
    
        // External controls (iOS only)
          case 'music-controls-toggle-play-pause' :
            // MusicControls.updateIsPlaying(true); 
            // MusicControls.updateDismissable(false);
          break;
          case 'music-controls-seek-to':
          const seekToInSeconds = JSON.parse(action).position;
          MusicControls.updateElapsed({
            elapsed: seekToInSeconds,
            isPlaying: true
          });
          // Do something
          break;

        // Headset events (Android only)
        // All media button events are listed below
        case 'music-controls-media-button' :
          // Do something
          break;
        case 'music-controls-headset-unplugged':
          // Do something
          break;
        case 'music-controls-headset-plugged':
          // Do something
          break;

        default:
          break;
      }
    });
    this.badge.clear();
  }

  upcomingShows()
  {
    if (!navigator.onLine) {
      alert("Please Check the Internet Connection");
      return
    }
    this.upcomingLoading = true;
    this.upcoming = [];
    this.http.get(
     'https://radiotalky.com/wp-json/wp/v2/posts?categories=49','',      
     { Authorization: 'Basic M2hXWEI3MGVKdHV2OkgxdVI1cXpDZlcwS3RUMU9pbGt0YjhjUA==' } 
    )
    .then(response => {
       try {
         response.data = JSON.parse(response.data);
         var responseMsg = JSON.parse(JSON.stringify(response.data));
         this.upcoming = response["data"]
         this.upcomingLoading = false
       } catch(e) {
         console.error('JSON parsing error');
         this.presentToast();
       }
    })
    .catch(response => {
      // prints 403
      console.log(response.status);
 
      // prints Permission denied
      console.log(response.error);
      this.presentToast();
    });
  }

  recentShows()
  {
    if (!navigator.onLine) {
      alert("Please Check the Internet Connection");
      return
    }
    this.recentLoading = true;
    this.recent = [];
    this.http.get(
      'https://radiotalky.com/wp-json/wp/v2/posts?categories=20','',         
      { Authorization: 'Basic M2hXWEI3MGVKdHV2OkgxdVI1cXpDZlcwS3RUMU9pbGt0YjhjUA==' } 
     )
     .then(response => {
        try {
          response.data = JSON.parse(response.data);
          // prints test
          var responseMsg = JSON.parse(JSON.stringify(response.data));
          this.recent = response["data"]
          this.recentLoading = false;
        } catch(e) {
          console.error('Server error');
          this.presentToast();
        }
      })
      .catch(response => {
        // prints 403
        console.log(response.status);

        // prints Permission denied
        console.log(response.error);
        this.presentToast();
      }
    );
  }

  playAnimation ()
  {
    //animation
    this.img1 = '../../assets/wave01.png';
    this.img2 = '../../assets/wave02.png';
    this.img3 = '../../assets/wave03.png';
    this.img4 = '../../assets/wave04.png';
    this.img5 = '../../assets/wave05.png';


    this.animation.addElement(document.querySelector('.square'))
    .duration(1500)
    .direction('alternate')
    .iterations(Infinity)
    .fromTo('transform', 'translateX(0%)', 'translateX(10%)')
    .fromTo('opacity', '1', '0.2');
    
    this.animation.play(); 
  } 

  stopAnimation () 
  {
    this.animation.stop();
  }

  playRadio () 
  {
    if (!navigator.onLine) {
      alert("Please Check the Internet Connection");
      return;
    }

    this.radioClicked = true;
    this.showClicked = false;
    this.title = "Now listening live";

    if (this.isShowPlaying == true) {
      this.recent[this.currentShowIndex].playing = false;
      this.isShowPlaying = false;
      this.show.nativeElement.pause();
      MusicControls.destroy(); 
      this.firstTime = true; 
    }

    if (this.firstTime == true) {
      this.music();
    }
    this.firstTime = false;

    if (this.isRadioPlaying == true) {
      this.isRadioPlaying = false;
      this.radio.nativeElement.pause();
    } else {
      this.isRadioPlaying = true;
      this.radio.nativeElement.src = this.radioUrl;
      this.radio.nativeElement.autobuffer = true;
      this.radio.nativeElement.onpause = () => {
        this.radio.nativeElement.src = null;
        this.radio.nativeElement.load();
        this.btnImage = '../../assets/play.png';
        document.getElementById('buttonImage').setAttribute( 'src', this.btnImage);
        this.stopAnimation();  
        if (this.radioClicked == true) {
          MusicControls.updateIsPlaying(false); 
        }
      }
      this.radio.nativeElement.load();
      this.radio.nativeElement.play();
      this.btnImage = '../../assets/stop.png';
      document.getElementById('buttonImage').setAttribute( 'src', this.btnImage);
      this.playAnimation();
      MusicControls.updateIsPlaying(true); 
    }
    this.badge.clear();
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: (this.recentLoading || this.upcomingLoading) ? 'Something went wrong.' : 'Show Unavailable.',
      position: 'top',
      duration: 2000
    });
    toast.present();
  }

  playShow(data: any, index: any) 
  {
    if (!navigator.onLine) {
      alert("Please Check the Internet Connection");
      return;
    }
    if (data.audio_url == null || data.audio_url == "" || data.audio_url === undefined) {
      this.presentToast();
      return;
    }

    this.radioClicked = false;
    this.showClicked = true;
    this.title = 'Now Playing' + '   ' + data.title.rendered;

    if (this.isRadioPlaying == true) {
      this.isRadioPlaying = false;
      this.btnImage = '../../assets/play.png';
      document.getElementById('buttonImage').setAttribute( 'src', this.btnImage);
      MusicControls.destroy();
      this.radio.nativeElement.pause();
      this.firstTime = true;
    }

    if (this.currentShowIndex != index) {
      if (this.currentShowIndex != null) {
        this.recent[this.currentShowIndex].playing = false;
      }
      MusicControls.destroy();
      this.currentShowIndex = index;
      this.show.nativeElement.pause();
      this.show.nativeElement.src = data.audio_url;
      this.radio.nativeElement.load();
      this.isShowPlaying = false;
      this.firstTime = true;
    }

    if (this.firstTime == true) {
      this.music();
    }
    this.firstTime = false;

    if (this.isShowPlaying == true ) {
      this.isShowPlaying = false;
      this.show.nativeElement.pause();
    } else {
      this.recent[index].playing = true;
      this.isShowPlaying = true;
      this.show.nativeElement.onended = () => {
        this.recent[this.currentShowIndex].playing = false;
        this.stopAnimation();
        MusicControls.updateIsPlaying(false); 
      }
      this.show.nativeElement.onpause = () => {
        this.recent[this.currentShowIndex].playing = false;
        this.stopAnimation();
        if (this.showClicked == true) {
          MusicControls.updateIsPlaying(false); 
        }
      }
      this.show.nativeElement.onplaying = () => {
        this.recent[this.currentShowIndex].playing = true;
        this.playAnimation();
        if (this.showClicked == true) {
          MusicControls.updateIsPlaying(true); 
        }
      }
      this.show.nativeElement.play();
      this.playAnimation();
      MusicControls.updateIsPlaying(true); 
    }
    this.badge.clear();
  }

  exit()
  {
    navigator['app'].exitApp();
  }
}