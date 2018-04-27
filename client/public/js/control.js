var app = angular.module('app', ["ngMaterial","ngRoute",'socialLogin',"ngCookies"]);
app.factory('accessFac',function($cookies){
  var obj = {}
  this.access = false;
  obj.getPermission = function(){    //set the permission to true
    
      this.access = true;
  }
  obj.checkPermission = function(){
    if($cookies.get("admin")=="admin"){
      return true;
    }
    else{
      return false;
    }            //returns the users permission level 
  }
  return obj;
});

app.config(function($routeProvider,socialProvider) {
    $routeProvider
    .when("/", {
      templateUrl : "views/login.html",
      controller:"control1"
    })
    .when("/dashU", {
      templateUrl : "views/dashboardU.html",
      controller:"control1",
    
    })
    .when("/new_user", {
      templateUrl : "views/newLogin.html",
      controller:"control2",
    
    })
    .when("/admin_login", {
      templateUrl : "views/login_admin.html",
      controller:"control1",
    
    })
    .when("/dashA", {
      templateUrl : "views/dashboardA.html",
      controller:"control1",
      resolve:{
        "check":function(accessFac,$location,$cookies){   //function to be resolved, accessFac and $location Injected
           if(accessFac.checkPermission()==false){
              $location.path('/');                //redirect user to home if it does not have permission.
              alert("You don't have access here");
            }else{

            }
        }
    }
    })
    socialProvider.setGoogleKey("Put your key");
  });
  ////custom directive for password check/////////
  app.directive('pwCheck', function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = '#' + attrs.pwCheck;
        elem.add(firstPassword).on('keyup', function () {
          scope.$apply(function () {
            var v = elem.val()===$(firstPassword).val();
            ctrl.$setValidity('pwmatch', v);
          });
        });
      }
    }
  });
app.controller('control1', function($scope,$location,$mdSidenav,$http,$rootScope,socialLoginService,$cookies,accessFac){
  ///variables/////
  if($cookies.get("admin")=="admin"){
    $location.path("/dashA");
  }
  $scope.tokenAdd="";
  $scope.money=0;
  $scope.deadline=undefined;
  $rootScope.balOfAdmin=undefined;
  $scope.isThisPreico=false;
  $scope.totalRaised=undefined;
  $rootScope.icostate="Presale";
  $scope.user_name=$cookies.get("user_key");
  console.log($cookies.get("user_key"));
  $scope.userLogin={}
  $scope.userLogin.email="";
  $scope.userLogin.pass="";
  $scope.userLogin.sec="";
  //fi=or admin
  $scope.adminLogin={}
  $scope.adminLogin.email="";
  $scope.adminLogin.password="";
  ///for user login//////
  $scope.userLoginF=function(){
    $http.get("http://localhost:3000/check?email="+$scope.userLogin.email+"&pass="+$scope.userLogin.pass+"&sec="+$scope.userLogin.sec).then(res=>{
    console.log(res);  
    if(res.data=="1"){
        console.log(res);
        $location.path("/dashU");
      }
    })
  }
  //for admin login///
  $scope.userLoginA=function(){
    console.log($scope.adminLogin.password);
    console.log($scope.adminLogin.email);
    $http.get("http://localhost:3000/checkAdmin?email="+$scope.adminLogin.email+"&pass="+$scope.adminLogin.password).then(res=>{
      if(res.data=="1"){
        $cookies.put("admin","admin");
        $location.path("/dashA");
      }
      else{
        alert("Please enter correct details");
      }
    })
  }
  /////////for admin dashboard///////
  console.log($cookies.get("admin"));
  $scope.openadminPage=function(){
    // $cookies.put("admin","admin");
    // $location.path("/dashA");
    $location.path("/admin_login");
    
  }
  $rootScope.$on('event:social-sign-in-success', function(event, userDetails){
    console.log(userDetails);
    $location.path("/dashU");
    $cookies.put("email",userDetails.email);
    
  })
 $scope.googleLog=function(){
  socialLoginService.logout();
  $cookies.remove("email");
  $rootScope.$on('event:social-sign-out-success', function(event, logoutStatus){
    console.log("yes");
  }) 
 }
 //for user logout
 $scope.logoutUser=function(){
   $cookies.remove("user_key");
   $location.path("/");
 }
 ///for deploying the contract of the preico
  $scope.deployPreico=function(){
    $cookies.put("preico","deployed");
  }
  function checkPreico(){
    if($cookies.get("preico")!=undefined){
      $scope.isThisPreico=false;
    }
    console.log($cookies.get("preico"));
  }
  checkPreico();
 /////////////////

  ////web3.js logic
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
web3.eth.defaultAccount = web3.eth.accounts[0];
web3.eth.getBalance(web3.eth.defaultAccount,function(err,res){
  $rootScope.balOfAdmin=JSON.stringify(res.toNumber());
});
/////////////contract detail///////////////
//put presale contract address here
var PresaleContract = web3.eth.contract([
	{
		"constant": false,
		"inputs": [
			{
				"name": "new_state",
				"type": "bytes32"
			}
		],
		"name": "change",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "to",
				"type": "address"
			},
			{
				"name": "tokens",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
]);
//put presale contract address here
contractIns = PresaleContract.at("");
// contractIns.changeStateOfIco($rootScope.icostate,{from:web3.eth.defaultAccount});
// function basicDetail(){
//   contractIns.totalRaised(function(err,res){
//     if(err) alert(err);
//     else{
//       $scope.totalRaised=res;
//     }
//   });
//   contractIns.timeLeft(function(err,res){
//     if(err) alert(err);
//     else{
//       $scope.deadline=res;
//     }
//   });
// }
// $scope.contribute=function(){
// contractIns.contribute({from:web3.eth.defaultAccount,value:web3.toWei($scope.money,"ether")});
// }
// $scope.addToken=function(){
  //contractIns.addDetail($scope.tokenAdd,{from:web3.eth.defaultAccount});
// }
// basicDetail();
/////////////////////////////////
//put the preico contract address here
var PreicoContract=web3.eth.contract([
	{
		"constant": false,
		"inputs": [
			{
				"name": "new_state",
				"type": "bytes32"
			}
		],
		"name": "change",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "to",
				"type": "address"
			},
			{
				"name": "tokens",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
]);
//contract functions
//put the preico contract here///
contractIns2= PreicoContract.at("");
//////////////////

/// for sidenav ///////
$scope.sideList=["Presale","Preico","Change status","Logout"]
$scope.toggleLeft = buildToggler('left');;
$scope.currentTab="Presale";
///for changeTab and logout
$scope.changeTab=function(str){
  console.log(str);
  if(str=="Logout"){
    $cookies.remove("admin","");
    $location.path("/");
    return;
  }
  $scope.currentTab=str;
}
function checkAdmin(){
 
}

function buildToggler(componentId) {
  return function() {
    $mdSidenav(componentId).toggle();
  };
}
    ///////for particle js//////////
    
    particlesJS("particles-js", {
        "particles": {
          "number": {
            "value": 80,
            "density": {
              "enable": true,
              "value_area": 700
            }
          },
          "color": {
            "value": "#ffffff"
          },
          "shape": {
            "type": "circle",
            "stroke": {
              "width": 0,
              "color": "#000000"
            },
            "polygon": {
              "nb_sides": 5
            },
          },
          "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
              "enable": false,
              "speed": 1,
              "opacity_min": 0.1,
              "sync": false
            }
          },
          "size": {
            "value": 3,
            "random": true,
            "anim": {
              "enable": false,
              "speed": 40,
              "size_min": 0.1,
              "sync": false
            }
          },
          "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
          },
          "move": {
            "enable": true,
            "speed": 6,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
              "enable": false,
              "rotateX": 600,
              "rotateY": 1200
            }
          }
        },
        "interactivity": {
          "detect_on": "canvas",
          "events": {
            "onhover": {
              "enable": true,
              "mode": "grab"
            },
            "onclick": {
              "enable": true,
              "mode": "push"
            },
            "resize": true
          },
          "modes": {
            "grab": {
              "distance": 140,
              "line_linked": {
                "opacity": 1
              }
            },
            "bubble": {
              "distance": 400,
              "size": 40,
              "duration": 2,
              "opacity": 8,
              "speed": 3
            },
            "repulse": {
              "distance": 200,
              "duration": 0.4
            },
            "push": {
              "particles_nb": 4
            },
            "remove": {
              "particles_nb": 2
            }
          }
        },
        "retina_detect": true
      });
    $scope.showParticles = true;
    $scope.newuser=function(){
        $location.path('/new_user');
    }
    checkAdmin();
});

app.controller('control2', function($scope,$rootScope,$http,$location,$cookies){
  $scope.userData={};
  $scope.userData.email="";
  $scope.userData.fname="";
  $scope.userData.lname="";
  $scope.pw1="";
  $scope.pw2="";
  ///to register user 
  $scope.registerUser=function(){
    console.log($scope.pw1);
    $http.get("http://localhost:3000/add?email="+$scope.userData.email+"&pass="+$scope.pw1).then(res=>{
      if(res.data!="0"){
        alert("Thanks your information has been saved.Please save your secret key for login "+res.data);
        $cookies.put("user_key",$scope.email);
        $location.path("/dashU");
      }
      else{
        alert("something went wrong");
      }
    });
  }
    $scope.showParticles = true;
    ////web3.js logic
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}
web3.eth.defaultAccount = web3.eth.accounts[0];
web3.eth.getBalance(web3.eth.defaultAccount,function(err,res){
  $scope.balOfUser=JSON.stringify(res.toNumber());
  console.log($scope.balOfUser);
});
 
    /////for particlejs////////
    particlesJS("particles-js", {
        "particles": {
          "number": {
            "value": 80,
            "density": {
              "enable": true,
              "value_area": 700
            }
          },
          "color": {
            "value": "#ffffff"
          },
          "shape": {
            "type": "circle",
            "stroke": {
              "width": 0,
              "color": "#000000"
            },
            "polygon": {
              "nb_sides": 5
            },
          },
          "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
              "enable": false,
              "speed": 1,
              "opacity_min": 0.1,
              "sync": false
            }
          },
          "size": {
            "value": 3,
            "random": true,
            "anim": {
              "enable": false,
              "speed": 40,
              "size_min": 0.1,
              "sync": false
            }
          },
          "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
          },
          "move": {
            "enable": true,
            "speed": 6,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
              "enable": false,
              "rotateX": 600,
              "rotateY": 1200
            }
          }
        },
        "interactivity": {
          "detect_on": "canvas",
          "events": {
            "onhover": {
              "enable": true,
              "mode": "grab"
            },
            "onclick": {
              "enable": true,
              "mode": "push"
            },
            "resize": true
          },
          "modes": {
            "grab": {
              "distance": 140,
              "line_linked": {
                "opacity": 1
              }
            },
            "bubble": {
              "distance": 400,
              "size": 40,
              "duration": 2,
              "opacity": 8,
              "speed": 3
            },
            "repulse": {
              "distance": 200,
              "duration": 0.4
            },
            "push": {
              "particles_nb": 4
            },
            "remove": {
              "particles_nb": 2
            }
          }
        },
        "retina_detect": true
      });
});
app.directive('particlesDrv',function($window,$log){
    return {
        restrict: 'A',
        template: '<div class="particleJs" id="particleJs"></div>',
        link: function(scope, element, attrs, fn) {
          $log.debug('test');
          $window.particlesJS('particleJs', {
            particles: {
              number: {
                value: 80,
                density: {
                  enable: true,
                  value_area: 800
                }
              },
              color: {
                value: '#FFFFFF'
              },
              shape: {
                type: "circle",
                polygon: {
                  nb_sides: 5
                }
              },
              opacity: {
                value: 0.5,
                random: false,
                anim: {
                  enable: false,
                  speed: 1,
                  opacity_min: 0.1,
                  sync: false
                }
              },
              size: {
                value: 5,
                random: true,
                anim: {
                  enable: false,
                  speed: 40,
                  size_min: 0.1,
                  sync: false
                }
              },
              line_linked: {
                enable: true,
                distance: 150,
                color: '#ffffff',
                opacity: 0.4,
                width: 1
              },
              move: {
                enable: true,
                speed: 6,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false,
                attract: {
                  enable: false,
                  rotateX: 600,
                  rotateY: 1200
                }
              }
            },
            interactivity: {
              detect_on: 'canvas',
              events: {
                onhover: {
                  enable: true,
                  mode: 'grab'
                },
                onclick: {
                  enable: true,
                  mode: 'push'
                },
                resize: true
              },
              modes: {
                grab: {
                  distance: 140,
                  line_linked: {
                    opacity: 1
                  }
                },
                bubble: {
                  distance: 400,
                  size: 40,
                  duration: 2,
                  opacity: 8,
                  speed: 3
                },
                repulse: {
                  distance: 200,
                  duration: 0.4
                },
                push: {
                  particles_nb: 4
                },
                remove: {
                  particles_nb: 2
                }
              }
            },
            retina_detect: true
          });
        }
      };
});
