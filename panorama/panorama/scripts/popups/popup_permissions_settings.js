'use strict';

var PopupPermissionsSettings = ( function(){

	var m_clanList = [];
	
	var _Init = function ()
	{
		_SyncDialogsFromSessionSettings( LobbyAPI.GetSessionSettings() );
	}

	var _SyncDialogsFromSessionSettings = function ( settings )
	{
		if ( !LobbyAPI.IsSessionActive() )
		{
			                                                                      
			                                                              
			$.DispatchEvent( 'UIPopupButtonClicked', '' );
			return;
		}
		                       
		                                                                                   
		                                                                               

		$('#JsPopUpPermissionsPrivate').checked = settings.system.access === "private" 
		$('#JsPopUpPermissionsPublic').checked = settings.system.access === "public";

		$('#JsPopUpPermissionsPrivate').SetPanelEvent( 'onactivate', function(){ _ShowPublicExtraSettings(); });
		$('#JsPopUpPermissionsPublic').SetPanelEvent( 'onactivate', function(){ _ShowPublicExtraSettings(); });

		var elDropdown = $('#JsPopUpPermissionsGroupsDropdown');

		var clanCount = MyPersonaAPI.GetMyClanCount();
		elDropdown.enabled = clanCount > 0;

		if( clanCount )
		{
			for( var i = 0; i < clanCount; i++ )
			{
				var clan = {};
				var id = MyPersonaAPI.GetMyClanIdByIndex( i );
				var newEntry = $.CreatePanel( 'Label', elDropdown, id, {
					class: 'DropDownMenu'
				});

				newEntry.text = MyPersonaAPI.GetMyClanTagById( id );
				elDropdown.AddOption(newEntry);
			}

			if( settings.game.clanid )
				elDropdown.SetSelected( settings.game.clanid );
		}

		                      
		$('#JsPopUpPermissionsNearby').checked = ( settings.game.nby === 1 );
		_ShowPublicExtraSettings();
	}

	var _ShowPublicExtraSettings = function ()
	{
		$('#JsPopUpPermissionsGroupsDropdown').enabled = $('#JsPopUpPermissionsPublic').checked;
		$('#JsPopUpPermissionsNearby').enabled = $('#JsPopUpPermissionsPublic').checked;
	}

	var _ApplySessionSettings = function ()
	{
		var selectedGroupEntryId = $('#JsPopUpPermissionsGroupsDropdown').GetSelected().id;
		var nearbySetting = $('#JsPopUpPermissionsNearby').checked ? 1 : 0;
		var accessSetting = $('#JsPopUpPermissionsPublic').checked ? "public" : "private";
		
		var settings = {
			update: {
				System: {
					access: accessSetting
				},
				Game: {
					nby: nearbySetting,
					clanid: selectedGroupEntryId !== 'NoGroup' ? selectedGroupEntryId : ''
				}
			}
		};

		if ( selectedGroupEntryId === 'NoGroup' )
		{
			settings.delete = {
				Game: {
					clandid: '#empty#'
				}
			}
		}

		                                                                                              
		InventoryAPI.SetUIPreferenceString( 'lobby_default_privacy_bits', "0" );
		InventoryAPI.SetUIPreferenceString( 'lobby_default_privacy_clan_enabled', ( selectedGroupEntryId !== 'NoGroup' ) ? "1" : "0" );
		InventoryAPI.SetUIPreferenceString( 'lobby_default_privacy_nearby_enabled', ''+nearbySetting );
		if ( selectedGroupEntryId !== 'NoGroup' )
		{
			InventoryAPI.SetUIPreferenceString( 'lobby_clanid', $('#JsPopUpPermissionsGroupsDropdown').GetSelected().id );
		}
		if ( $('#JsPopUpPermissionsPublic').checked && InventoryAPI.GetUIPreferenceString( 'lobby_default_privacy_bits' ) === "0" )
		{
			InventoryAPI.SetUIPreferenceString( 'lobby_default_privacy_bits', $('#JsPopUpPermissionsPublic').checked ? "1" : "0" );
		}

		LobbyAPI.UpdateSessionSettings( settings );
		$.DispatchEvent( 'UIPopupButtonClicked', '' );
	}

	return {
		Init					:	_Init,
		ApplySessionSettings	:	_ApplySessionSettings
	};

})();

  

			              
			          
				              
					                            
				       
				            
					                             
					                            
					                                         
				       
				               
					                          
					                                               
				       
				                
					      
				       
				                  
					      
				                

					
	         
	               
	                 
	                    
	                             
	 
	      
	              
	             
	               
	                   
	                    
	                    
	      
	                       
	                      
	                  
	                                                    
	 
	        
	               
	              
	 
	         
	                            
	                           
	                         
	            
		                                                
		                    
		                         
		                      
		              
		                   
		         
		                                                    
		             
		        
			                     
			                      
			                      
			                    
			                                   
			                     
			                                                                                                                                  
			                        
			                    
			    
		   
		 
	   
	 
 
  