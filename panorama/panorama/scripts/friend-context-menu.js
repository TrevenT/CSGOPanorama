'use strict';

                                                                                                    
                                         
                                                                                                    

var friendContextMenu = (function() {

	var _ContextMenus = [
		  
		 
			                                                                            
			                                   
				                                                                 
				            	
			  
			                              
				                                    
			 
		  
		  
		{
			name: 'invite',
			AvailableForItem: function ( id ) {
				return FriendsListAPI.IsFriendPlayingCSGO( id ) || TeammatesAPI.GetCoPlayerInCSGO( id );
			},
			OnSelected:  function ( id ) {
				FriendsListAPI.ActionInviteFriend( id );
			}
		},
		{
			name: 'join',
			AvailableForItem: function ( id ) {
				return FriendsListAPI.IsFriendJoinable( id );
			},
			OnSelected:  function ( id ) {
				FriendsListAPI.ActionJoinFriendSession( id );
			}
		},
		{
			name: 'watch',
			AvailableForItem: function ( id ) {
				return FriendsListAPI.IsFriendWatchable( id );
			},
			OnSelected:  function ( id ) {
				FriendsListAPI.ActionWatchFriendSession( id );
			}
		},
		{
			name: 'steamprofile',
			AvailableForItem: function ( id ) {
				return 	MyPersonaAPI.GetLauncherType() !== "perfectworld";
				
			},
			OnSelected:  function ( id ) {
				SteamOverlayAPI.ShowUserProfilePage( id );
			}
		},
		{
			name: 'message',
			AvailableForItem: function ( id ) {
				return FriendsListAPI.GetFriendRelationship( id ) === "friend";

			},
			OnSelected:  function ( id ) {
				SteamOverlayAPI.StartChatWithUser( id );
			}
		},
		{
			name: 'summonmissioncoopmission',
			AvailableForItem: function ( id ) {
				return false;
			},
			OnSelected:  function ( id ) {
			}
		},
		{
			name: 'summonmissioncoop',
			AvailableForItem: function ( id ) {
				return false;
			},
			OnSelected:  function ( id ) {
			}
		},
		{
			name: 'friendaccept',
			AvailableForItem: function ( id ) {
				return FriendsListAPI.GetFriendStatusBucket( id ) === 'AwaitingLocalAccept';
			},
			OnSelected:  function ( id ) {
				SteamOverlayAPI.InteractWithUser( id, 'friendrequestaccept' );
			}
		},
		{
			name: 'friendignore',
			AvailableForItem: function ( id ) {
				return FriendsListAPI.GetFriendStatusBucket( id ) === 'AwaitingLocalAccept';
			},
			OnSelected:  function ( id ) {
				SteamOverlayAPI.InteractWithUser( id, 'friendrequestignore' );
			}
		},
		{
			name: 'cancelinvite',
			AvailableForItem: function ( id ) {
				return FriendsListAPI.GetFriendStatusBucket( id ) === 'AwaitingRemoteAccept';
			},
			OnSelected:  function ( id ) {
				SteamOverlayAPI.InteractWithUser( id, 'friendremove' );
			}
		},
		{
			name: 'removefriend',
			AvailableForItem: function ( id ) {
				if( MyPersonaAPI.GetLauncherType() !== "perfectworld" )
				{
					if ( id === MyPersonaAPI.GetXuid() ) return false;
					var status = FriendsListAPI.GetFriendStatusBucket( id );
					return status !== 'AwaitingRemoteAccept' && status !== 'AwaitingLocalAccept';
				}

				return false;
			},
			OnSelected:  function ( id ) {
				SteamOverlayAPI.InteractWithUser( id, 'friendremove' );
			}
		},
		{
			name: 'request',
			AvailableForItem: function ( id ) {
				var isSelf = id === MyPersonaAPI.GetXuid() ? true : false;
				
				return FriendsListAPI.GetFriendRelationship( id ) === "friend" && !isSelf;
			},
			OnSelected:  function ( id ) {
				SteamOverlayAPI.InteractWithUser( id, 'friendadd' );
			}
		}
	];

	var _OnContextMenu = function ( id )
	{
		                                                                                                                                                                                                         
		                                 

		                                                                   
		var items = [];

		_ContextMenus.forEach( function( entry ) {
			if ( entry.AvailableForItem( id )) {
				items.push({
					icon: 'file://{images}/icons/leader.png',
					label: $.Localize( 'SFUI_InvContextMenu_' + entry.name ),
					jsCallback: entry.OnSelected.bind( this, id )
				});
			}
		} );

		UiToolkitAPI.ShowSimpleContextMenu( '', 'ItemTileContextMenu', items );
	}

	                      
	return { 
		OnContextMenu : _OnContextMenu                      
	};

})();

  
                           
 	
	                                        
	
	                   
	 
		   	                              
		                                                            
		
		                                                              

		                                
			           
	 
	
	            
 

                                  
 	
	                                        
	
	                   
	 
		   	                              
		                                                            
		
		                                                              

		                                
			           
	 
	
	            
 

                           
 
	   	                              
	                                                                   
	                                                                                             
	
	                                                  
	                                                                              
	                                                                             
	
	                                                                                        
	 
		                                                                         
		                                                                                 
		                                                                                        
		
		                                                            
		
		              
	 
	    
	 	         
 

                                                  
 
	                                        
	
	                   
	 
		   	                              
		                                                  
		                                                            
		
		                                                                 
			                       
		
		                                                                  
		
		                                                                                  
		                                                                        
	 
	
	                                                       
 

                              
 
	                                        
 

                            
 
	                                             
 

                             
 
	                                              
 

                                 
 
	                                           
 

                                    
 
	                                          
 

                               
 
	                                        
 

                                                      
 
	                                                  
 
  



