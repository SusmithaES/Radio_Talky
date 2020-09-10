import { Component, ViewChild} from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { createAnimation } from '@ionic/core';
import { HTTP } from '@ionic-native/http/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';

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
  title: string = " ";
  upcomingLoading: boolean = true;
  recentLoading: boolean = true;
  showTimeout: any = null;
  showDuration: any = 0;
  live: MediaObject = this.media.create(this.radioUrl);

  @ViewChild('radioPlayer') radio: any;
  @ViewChild('showPlayer') show: any;
 
  isRadioPlaying : boolean = false;
  isShowPlaying : boolean = false;
  btnImage: any = '../../assets/play.png';
  show_playImg: any = '../../assets/Playmark_white2.png';
  show_pauseImg: any = '../../assets/pausemark_white2.png';

  constructor(private network: Network, private http: HTTP, private media: Media) 
  { 
    this.network.onConnect().subscribe(() => {
      this.upcomingShows();
      this.recentShows();
    });

    this.network.onDisconnect().subscribe(() => {
      if (this.isRadioPlaying ==true) {
        this.isRadioPlaying = false;
        //this.radio.nativeElement.pause();
        this.live.stop();
        this.btnImage = '../../assets/play.png';
        this.stopAnimation();
      }
  
      if (this.isShowPlaying == true ) {
        this.isShowPlaying = false;
        this.show.nativeElement.pause();
        this.stopAnimation();
      }
      alert("Please Check the Internet Connection");
    });

    this.upcomingShows();
    this.recentShows();
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
       }
    })
    .catch(response => {
      // prints 403
      console.log(response.status);
 
      // prints Permission denied
      console.log(response.error);
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
          console.error('JSON parsing error');
        }
      })
      .catch(response => {
        // prints 403
        console.log(response.status);

        // prints Permission denied
        console.log(response.error);
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

    const animation = createAnimation()
    .addElement(document.querySelector('.square'))
    .duration(1500)
    .direction('alternate')
    .iterations(Infinity)
    .fromTo('transform', 'translateX(0%)', 'translateX(10%)')
    .fromTo('opacity', '1', '0.2');
    
    animation.play(); 
  } 

  stopAnimation () 
  {
    const animation = stop()
    this.img1 = null;
    this.img2 = null;
  }

  playRadio () 
  {
    if (!navigator.onLine) {
      alert("Please Check the Internet Connection");
      return;
    }

    this.title = "Now listening live";

    if (this.isShowPlaying == true) {
      this.recent[this.currentShowIndex].playing = false;
      this.isShowPlaying = false;
      this.show.nativeElement.pause();
      if (this.showTimeout != null) {
        clearTimeout(this.showTimeout);
      }      
    }

    if (this.isRadioPlaying ==true) {
      this.title = "Listen Now";
      this.isRadioPlaying = false;
      //this.radio.nativeElement.pause();
      this.live.stop();
      this.btnImage = '../../assets/play.png';
      this.stopAnimation();    
    } else {
      this.isRadioPlaying = true;
      //this.radio.nativeElement.play();
      this.live.play();
      this.btnImage = '../../assets/pause.png';
      this.playAnimation();
    }
  }

  playShow(data: any, index: any) 
  {
    if (!navigator.onLine) {
      alert("Please Check the Internet Connection");
      return;
    }

    this.title = 'Now Playing' + '   ' + data.title.rendered;

    if (this.isRadioPlaying == true) {
      this.isRadioPlaying = false;
      //this.radio.nativeElement.pause();
      this.live.stop();
      this.btnImage = '../../assets/play.png';
    }

    if (this.currentShowIndex != index) {
      if (this.currentShowIndex != null) {
        this.recent[this.currentShowIndex].playing = false;
      }
      this.currentShowIndex = index;
      this.show.nativeElement.pause();
      this.show.nativeElement.src = data.audio_url;
      this.isShowPlaying = false;
      if (this.showTimeout != null) {
        clearTimeout(this.showTimeout);
      }
    }

    if (this.isShowPlaying == true ) {
      this.title = "Listen Now";
      this.recent[index].playing = false;
      this.isShowPlaying = false;
      this.show.nativeElement.pause();
      this.stopAnimation();
    } else {
      this.recent[index].playing = true;
      this.isShowPlaying = true;
      this.show.nativeElement.play();
      this.playAnimation();
      // this.showTimeout = setTimeout(() => {
      //   this.isShowPlaying = false;
      //   this.stopAnimation();
      // }, (this.show.nativeElement.duration + 1) * 1000);
    }
  }

  exit()
  {
    navigator['app'].exitApp();
  }
}