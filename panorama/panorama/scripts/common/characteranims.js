'use strict';

var CharacterAnims = ( function ()
{
	  
	                                        
	               
		      
		      
		           
		        
		             
		               
		               
	  

	var _PlayAnimsOnPanel = function ( settings )
	{
		if ( settings === null ) {
			return;
		}
		
		var playerPanel = settings.panel;
		_CancelScheduledAnim( playerPanel );
		_ResetLastRandomAnimHandle( playerPanel );
		
		playerPanel.ResetAnimation( false );
		playerPanel.SetSceneAngles( 0, 0, 0 );
		playerPanel.SetPlayerModel( settings.modelPath );
		playerPanel.EquipPlayerWithItem( settings.itemId );

		var anims = _GetAnims(
						settings.team,
						settings.loadoutSlot,
						settings.selectedWeapon,
						settings.itemId
					);
		
		if ( settings.playIntroAnim ) {
			playerPanel.LayerSequence( anims.intro, false, false );
		}

		playerPanel.LayerSequence( anims.idle , true, true );
		playerPanel.SetCameraPreset( anims.cameraPreset, false );

		settings.anims = anims;
		_playRandomAnim( settings );
	};

	var _playRandomAnim = function ( settings )
	{
		var playerPanel = settings.panel;
		var anims = settings.anims;

		if ( !playerPanel.IsValid() )
		{
			return;
		}

		                          
		if ( anims.animsList !== undefined )
		{
			playerPanel.Data().lastRandomAnim = _RandomNumberWithBoundsDontRepeatPrevious(
													0,
													anims.animsList.length - 1,
													playerPanel.Data().lastRandomAnim 
												);

			                                                                                                          
			playerPanel.LayerSequence( anims.animsList[ playerPanel.Data().lastRandomAnim], false, true );
		}

		                                                                   
		playerPanel.Data().handle = $.Schedule(
										_RandomNumberWithBounds( 15, 18 ),
										_playRandomAnim.bind( undefined, settings )
									);
	};

	var _RandomNumberWithBounds = function ( min, max )
	{
		return Math.floor( Math.random() * ( max - min + 1 ) + min );
	};

	                                                
	var _RandomNumberWithBoundsDontRepeatPrevious = function ( min, max, prev )
	{
		var randomNum;

		do {
			randomNum = Math.floor( Math.random() * ( max - min + 1 ) + min );

		} while ( randomNum == prev );

		return randomNum;
	};

	var _CancelScheduledAnim = function ( playerPanel )
	{
		                                                                                             
		if ( playerPanel.Data().handle )
		{
			$.CancelScheduled( playerPanel.Data().handle );
			playerPanel.Data().handle = null;
		}
	};

	var _ResetLastRandomAnimHandle = function ( playerPanel)
	{
		if ( playerPanel.Data().lastRandomAnim !== -1 ) {
			playerPanel.Data().lastRandomAnim = -1;
		}
	};

	                                                                                                    
	                                                          
	                                                                                                    
	var _SaveModelPanelSettingsToConvars = ( function ()
	{
		var settingsToSave = null;

		var _SetSettings = function ( settings )
		{
			settingsToSave = settings;
		};
		
		var _SaveSettings = function () 
		{
			if( settingsToSave )
			{
				InventoryAPI.SetUIPreferenceString( 'ui_vanitysetting_team', settingsToSave.team );
				InventoryAPI.SetUIPreferenceString( 'ui_vanitysetting_model', settingsToSave. modelPath );
				InventoryAPI.SetUIPreferenceString( 'ui_vanitysetting_loadoutslot', settingsToSave.loadoutSlot );
				InventoryAPI.SetUIPreferenceString( 'ui_vanitysetting_itemid', settingsToSave.itemId );
			}
			settingsToSave = null;
		};

		return {
			SaveSettings : _SaveSettings,
			SetSettings : _SetSettings,
		};

	})();
	

	var _ItemHasCharacterAnims = function( team, loadoutSlot, selectedWeapon, itemId )
	{
		                                                                                      
		var hasAnims = _GetAnims( team, loadoutSlot, selectedWeapon, itemId ) !== undefined ? true : false;

		                                                 
		return hasAnims;
	};

	                                                                                                    
	                                                                                                      
	                                                               
	                                                                                                    
	var _GetAnims = function ( team, loadoutSlot, weapon, itemId )
	{	
		if ( !loadoutSlot )
		{
			if ( team == 'ct' )
			{
				return {
					cameraPreset: 1,
					intro: 'ct_loadout_knife_walkup',
					idle: 'ct_loadout_knife_idle',
					animsList: [
						'ct_loadout_knife_headtilt',
						'ct_loadout_knife_lookat01',
						'ct_loadout_knife_lookat02',
						'ct_loadout_knife_shrug',
						'ct_loadout_knife_flip01',
						'ct_loadout_knife_slicedice01',
						'ct_loadout_knife_slicedice02',
						'ct_loadout_knife_backflip'
					]
				};
			}
			else
			{
				return {
					cameraPreset: 1,
					intro: 't_loadout_knife_walkup',
					idle: 't_loadout_knife_idle',
					animsList: [
						't_loadout_knife_weightshift01',
						't_loadout_knife_headtilt',
						't_loadout_knife_bladewipe',
						't_loadout_knife_threaten',
						't_loadout_knife_flip_frontandback',
						't_loadout_knife_fancymoves',
						't_loadout_knife_slicedice01',
						't_loadout_knife_slicedice02',
						't_loadout_knife_flipandslice'
					]
				};
			}	
		}


		if( team == 'ct' )
		{
			if( loadoutSlot.indexOf( 'melee' ) !== -1 )
			{
				              
				var defName = InventoryAPI.GetItemDefinitionName( itemId );
				if( defName.indexOf( 'push' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 'ct_loadout_push_walkup',
						idle: 'ct_loadout_push_idle',
						animsList: [
							'ct_loadout_push_lookat01',
							'ct_loadout_push_lookat02',
							'ct_loadout_push_shrug',
							'ct_loadout_push_lookat03',
							'ct_loadout_push_raise'
						]
					};
				}
				                
				defName = InventoryAPI.GetItemDefinitionName( itemId );
				if( defName.indexOf( 'karambit' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 'ct_loadout_knife_walkup',
						idle: 'ct_loadout_knife_idle',
						animsList: [
							'ct_loadout_knife_headtilt',
							'ct_loadout_knife_lookat01',
							'ct_loadout_knife_lookat02',
							'ct_loadout_knife_shrug',
							'ct_loadout_knife_flip01',
							'ct_loadout_knife_slicedice02'
						]
					};
				}

				          
				return {
					cameraPreset: 1,
					intro: 'ct_loadout_knife_walkup',
					idle: 'ct_loadout_knife_idle',
					animsList: [
						'ct_loadout_knife_headtilt',
						'ct_loadout_knife_lookat01',
						'ct_loadout_knife_lookat02',
						'ct_loadout_knife_shrug',
						'ct_loadout_knife_flip01',
						'ct_loadout_knife_slicedice01',
						'ct_loadout_knife_slicedice02',
						'ct_loadout_knife_backflip'					
						]
					};
			}		
			           
			if( loadoutSlot.indexOf( 'secondary') !== -1 || loadoutSlot.indexOf( 'smg') !== -1 )
			{	
				               
				if( weapon.indexOf( 'elite' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 'ct_loadout_dual_walkup',
						idle: 'ct_loadout_dual_idle',
						animsList: [
							'ct_loadout_dual_lookat01',
							'ct_loadout_dual_lookat02',
							'ct_loadout_dual_shrug',
							'ct_loadout_dual_lookat03',
							'ct_loadout_dual_raise'
						]
					};
				}
				      
				if( weapon.indexOf( 'p90' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_p90_walkup',
						idle: 'ct_loadout_p90_idle',
						animsList: [
							'ct_loadout_p90_weightshift01',
							'ct_loadout_p90_lookbehind01',
							'ct_loadout_p90_lookatwatch',
							'ct_loadout_p90_lookbehind02'
						]
					};
				}
				      
				if( weapon.indexOf( 'mp9' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_mp9_walkup',
						idle: 'ct_loadout_p90_idle',
						animsList: [
							'ct_loadout_p90_weightshift01',
							'ct_loadout_p90_lookbehind01',
							'ct_loadout_p90_lookatwatch',
							'ct_loadout_p90_lookbehind02'
						]
					};
				}
				        
				if( weapon.indexOf( 'ump45' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_ump45_walkup',
						idle: 'ct_loadout_p90_idle',
						animsList: [
							'ct_loadout_p90_weightshift01',
							'ct_loadout_p90_lookbehind01',
							'ct_loadout_p90_lookatwatch',
							'ct_loadout_p90_lookbehind02'
						]
					};
				}
				        
				if( weapon.indexOf( 'bizon' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_p90_walkup',
						idle: 'ct_loadout_p90_idle',
						animsList: [
							'ct_loadout_p90_weightshift01',
							'ct_loadout_p90_lookbehind01',
							'ct_loadout_p90_lookatwatch',
							'ct_loadout_p90_lookbehind02'
						]
					};
				}
				      
				if( weapon.indexOf( 'mp7' ) !== -1 )
				{
					return {
						cameraPreset: 4,
						intro: 'ct_loadout_mp7_walkup',
						idle: 'ct_loadout_mp7_idle',
						animsList: [
							'ct_loadout_mp7_weightshift',
							'ct_loadout_mp7_lookscreenLshakehand',
							'ct_loadout_mp7_lookbehindscreenL',
							'ct_loadout_mp7_lookatgun',
							'ct_loadout_mp7_scanscreenL'
						]
					};
				}
				        
				                                        
				   
				  	        
				  		                
				  		                                 
				  		                            
				  		            
				  			                               
				  			                              
				  			                             
				  			                             
				  		 
				  	  
				   
				          
				return {
					cameraPreset: 0,
					intro: 'ct_loadout_pistol01_walkup',
					idle: 'ct_loadout_pistol01_idle',
					animsList: [
						'ct_loadout_pistol01_lookscreenLshakehand',
						'ct_loadout_pistol01_weightshift',
						'ct_loadout_pistol01_lookbehindscreenL',
						'ct_loadout_pistol01_lookatgun',
						'ct_loadout_pistol01_scanscreenL'
					]
				};
			}
			
			if( loadoutSlot.indexOf( 'rifle' ) !== -1 )
			{
				if( weapon.indexOf( 'famas' ) !== -1  )
				{
					                 
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_famas_walkup',
						idle: 'ct_loadout_famas_idle',
						animsList: [
								'ct_loadout_famas_weightshift01',
								'ct_loadout_famas_lookbehind01',
								'ct_loadout_famas_lookatwatch',
								'ct_loadout_famas_lookbehind02'
						]
					};
					
				}
				
				if( weapon.indexOf( 'm4a1' ) !== -1 || weapon.indexOf( 'm4a1_silencer') !== -1   )
				{
					return {
						cameraPreset: 1,
						intro: 'ct_loadout_rifle_walkup_handrepo_m4',
						idle: 'ct_loadout_rifle_idle_handrepo_m4',
						animsList: [
								'ct_loadout_rifle_lookat_handrepo_m4',
								'ct_loadout_rifle_shouldershrug_handrepo_m4',
								'ct_loadout_rifle_weightshift_handrepo_m4'
						]
					};
				}
				if( weapon.indexOf( 'aug' ) !== -1  )
				{
					               
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_rifle_walkup_handrepo_aug',
						idle: 'ct_loadout_rifle_idle_handrepo_aug',
						animsList: [
								'ct_loadout_rifle_weightshift01_handrepo_aug',
								'ct_loadout_rifle_lookbehind01_handrepo_aug',
								'ct_loadout_rifle_lookatwatch_handrepo_aug',
								'ct_loadout_rifle_lookbehind02_handrepo_aug'
						]
					};
					
				}
				if( weapon.indexOf( 'ssg08' ) !== -1  )
				{
					                 
					return {
						cameraPreset: 1,
						intro: 'ct_loadout_rifle_ssg08_walkup',
						idle: 'ct_loadout_rifle_ssg08_idle',
						animsList: [
								'ct_loadout_rifle_ssg08_lookat',
								'ct_loadout_rifle_ssg08_shouldershrug',
								'ct_loadout_rifle_ssg08_weightshift'
						]
					};
					
				}
				if( weapon.indexOf( 'awp' ) !== -1  )
				{
					               
					return {
						cameraPreset: 1,
						intro: 'ct_loadout_rifle_awp_walkup',
						idle: 'ct_loadout_rifle_awp_idle',
						animsList: [
								'ct_loadout_rifle_awp_lookat',
								'ct_loadout_rifle_awp_shouldershrug',
								'ct_loadout_rifle_awp_weightshift'
						]
					};
					
				}
				
				                  
				return {
					cameraPreset: 1,
					intro: 'ct_loadout_rifle_scar_walkup',
					idle: 'ct_loadout_rifle_scar_idle',
					animsList: [
						'ct_loadout_rifle_scar_lookat',
						'ct_loadout_rifle_scar_shouldershrug',
						'ct_loadout_rifle_scar_weightshift'
					]
				};
				
			}

			if( loadoutSlot.indexOf( 'heavy' ) !== -1 )
			{
				if( weapon.indexOf( 'nova' ) !== -1  )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_nova_walkup',
						idle: 'ct_loadout_nova_idle',
						animsList: [
							'ct_loadout_nova_weightshift',
							'ct_loadout_nova_shrug',
							'ct_loadout_nova_lookbehind',
							'ct_loadout_nova_gunlift',
							'ct_loadout_nova_lookat01'
						]
					};
				}
				if (weapon.indexOf( 'xm1014' ) !== -1  )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_xm1014_walkup',
						idle: 'ct_loadout_xm1014_idle',
						animsList: [
							'ct_loadout_xm1014_weightshift',
							'ct_loadout_xm1014_shrug',
							'ct_loadout_xm1014_lookbehind',
							'ct_loadout_xm1014_gunlift',
							'ct_loadout_xm1014_lookat01'
						]
					};
				}
				if( weapon.indexOf( 'mag7' ) !== -1  )
				{
					return {
						cameraPreset: 2,
						intro: 'ct_loadout_mag7_walkup',
						idle: 'ct_loadout_mag7_idle',
						animsList: [
								'ct_loadout_mag7_weightshift01',
								'ct_loadout_mag7_lookbehind01',
								'ct_loadout_mag7_lookatwatch',
								'ct_loadout_mag7_lookbehind02'
						]
					};
					
				}
				if( weapon.indexOf( 'negev' ) !== -1  )
				{
					return {
						cameraPreset: 3,
						intro: 'ct_loadout_negev_walkup',
						idle: 'ct_loadout_negev_idle',
						animsList: [
							'ct_loadout_negev_lookat01',
							'ct_loadout_negev_lookat02',
							'ct_loadout_negev_lookback',
							'ct_loadout_negev_lift01',
							'ct_loadout_negev_lift02',
							'ct_loadout_negev_weightshift'
						]
					};
				}
				
			if ( loadoutSlot.indexOf( 'flashbang' ) !== -1 || loadoutSlot.indexOf( 'decoy') !== -1 )
			{
				                              
				return {
					cameraPreset: 0,
					intro: 'ct_loadout_frag01_walkup',
					idle: 'ct_loadout_frag01_idle',
					animsList: [
						'ct_loadout_frag01_touch',
						'ct_loadout_frag01_lookat01',
						'ct_loadout_frag01_toss01',
						'ct_loadout_frag01_toss02'
					]
				};
			}
			
			if ( loadoutSlot.indexOf( 'smokegrenade' ) !== -1 || loadoutSlot.indexOf( 'incgrenade') !== -1 || loadoutSlot.indexOf( 'hegrenade') !== -1 )
			{
				                                  
				return {
					cameraPreset: 0,
					intro: 'ct_loadout_frag02_walkup',
					idle: 'ct_loadout_frag02_idle',
					animsList: [
						'ct_loadout_frag02_touch',
						'ct_loadout_frag02_lookat01',
						'ct_loadout_frag02_toss01',
						'ct_loadout_frag02_toss02'
					]
				};
			}
			
		
				          
				return {
					cameraPreset: 3,
					intro: 'ct_loadout_heavy_walkup',
					idle: 'ct_loadout_heavy_idle',
					animsList: [
						'ct_loadout_heavy_lookat01',
						'ct_loadout_heavy_lookat02',
						'ct_loadout_heavy_lookback',
						'ct_loadout_heavy_lift01',
						'ct_loadout_heavy_lift02',
						'ct_loadout_heavy_weightshift'
					]
				};
			}
		}
		else
		{
			          
			if ( loadoutSlot.indexOf( 'c4' ) !== -1 )
			{
				    
				return {
					cameraPreset: 0,
					intro: 't_loadout_c4_walkup',
					idle: 't_loadout_c4_idle',
					animsList: [
						't_loadout_c4_lookat01',
						't_loadout_c4_catch',
						't_loadout_c4_bobble',
						't_loadout_c4_lookat02'
					]
				};
			}

			if ( loadoutSlot.indexOf( 'flashbang' ) !== -1 || loadoutSlot.indexOf( 'decoy') !== -1 )
			{
				                              
				return {
					cameraPreset: 0,
					intro: 't_loadout_frag_walkup',
					idle: 't_loadout_frag_idle',
					animsList: [
						't_loadout_frag_lookat',
						't_loadout_frag_toss01',
						't_loadout_frag_toss02',
						't_loadout_frag_weightshift'
					]
				};
			}
			
			if ( loadoutSlot.indexOf( 'smokegrenade' ) !== -1 || loadoutSlot.indexOf( 'incgrenade') !== -1 || loadoutSlot.indexOf( 'hegrenade') !== -1 )
			{
				                                  
				return {
					cameraPreset: 0,
					intro: 't_loadout_molotov_walkup',
					idle: 't_loadout_molotov_idle',
					animsList: [
						't_loadout_molotov_lookat',
						't_loadout_molotov_toss01',
						't_loadout_smoke_incen_toss02',
						't_loadout_molotov_weightshift'
					]
				};
			}
			
			if ( loadoutSlot.indexOf( 'molotov' ) !== -1 )
			{
				              
				return {
					cameraPreset: 0,
					intro: 't_loadout_molotov_walkup',
					idle: 't_loadout_molotov_idle',
					animsList: [
						't_loadout_molotov_lookat',
						't_loadout_molotov_toss01',
						't_loadout_molotov_toss02',
						't_loadout_molotov_weightshift'
					]
				};
			}
			
			if( loadoutSlot.indexOf( 'melee' ) !== -1 )
			{
				             
				var defName = InventoryAPI.GetItemDefinitionName( itemId );
				if( defName.indexOf( 'push' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_push_walkup',
						idle: 't_loadout_push_idle',
						animsList: [
							't_loadout_push_bellyrub',
							't_loadout_push_lookat01',
							't_loadout_push_lookat02',
							't_loadout_push_aimknife',
							't_loadout_push_lookat03',
							't_loadout_push_headtilt'
						]
					};
				}
				                
				defName = InventoryAPI.GetItemDefinitionName( itemId );
				if( defName.indexOf( 'karambit' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_knife_walkup',
						idle: 't_loadout_knife_idle',
						animsList: [
							't_loadout_knife_weightshift01',
							't_loadout_knife_headtilt',
							't_loadout_knife_threaten',
							't_loadout_knife_flip_frontandback',
							't_loadout_knife_fancymoves',
							't_loadout_knife_slicedice01',
							't_loadout_knife_slicedice02',
							't_loadout_knife_flipandslice'
						]
					};
				}	
				          
				return {
					cameraPreset: 1,
					intro: 't_loadout_knife_walkup',
					idle: 't_loadout_knife_idle',
					animsList: [
						't_loadout_knife_weightshift01',
						't_loadout_knife_headtilt',
						't_loadout_knife_bladewipe',
						't_loadout_knife_threaten',
						't_loadout_knife_flip_frontandback',
						't_loadout_knife_fancymoves',
						't_loadout_knife_slicedice01',
						't_loadout_knife_slicedice02',
						't_loadout_knife_flipandslice'
					]
				};
			}	
			if( loadoutSlot.indexOf( 'secondary') !== -1 ||  loadoutSlot.indexOf( 'smg') !== -1)
			{
				if( weapon.indexOf( 'elite' ) !== -1 )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_dual_walkup',
						idle: 't_loadout_dual_idle',
						animsList: [
							't_loadout_dual_bellyrub',
							't_loadout_dual_lookatgun01',
							't_loadout_dual_lookatgun02',
							't_loadout_dual_lookatgun03',
							't_loadout_dual_headtilt'
						]
					};
				}
				
				if( weapon.indexOf( 'revolver' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 't_loadout_pistol_walkup',
						idle: 't_loadout_pistol_idle',
						animsList: [
							't_loadout_pistol_weightshift',
							't_loadout_pistol_lookat_pistol',
							't_loadout_pistol_lookat_pistol02',
							't_loadout_pistol_headscratch',
							't_loadout_pistol_buttscratch'
						]
					};
				}
				if( weapon.indexOf( 'p90' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 't_loadout_p90_walkup',
						idle: 't_loadout_p90_idle',
						animsList: [
							't_loadout_p90_weightshift',
							't_loadout_p90_lookataround',
							't_loadout_p90_lookatgun',
							't_loadout_p90_lookaround02',
							't_loadout_p90_spray',
							't_loadout_p90_lookaround03'
						]
					};
				}
				if( weapon.indexOf( 'ump45' ) !== -1 )
				{
					return {
						cameraPreset: 0,
						intro: 't_loadout_ump45_walkup',
						idle: 't_loadout_ump45_idle',
						animsList: [
							't_loadout_ump45_weightshift',
							't_loadout_ump45_lookataround',
							't_loadout_ump45_lookatgun',
							't_loadout_ump45_lookaround02',
							't_loadout_ump45_spray',
							't_loadout_ump45_lookaround03'
						]
					};
				}
				if( weapon.indexOf( 'mp7' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 't_loadout_mp7_walkup',
						idle: 't_loadout_mp7_idle',
						animsList: [
							't_loadout_mp7_weightshift',
							't_loadout_mp7_lookataround',
							't_loadout_mp7_lookatgun',
							't_loadout_mp7_lookaround02',
							't_loadout_mp7_spray',
							't_loadout_mp7_lookaround03'
						]
					};
				}
				if( weapon.indexOf( 'bizon' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 't_loadout_bizon_walkup',
						idle: 't_loadout_bizon_idle',
						animsList: [
							't_loadout_bizon_weightshift',
							't_loadout_bizon_lookataround',
							't_loadout_bizon_lookatgun',
							't_loadout_bizon_lookaround02',
							't_loadout_bizon_spray',
							't_loadout_bizon_lookaround03'
						]
					};
				}
				         
				if( weapon.indexOf( 'mac10' ) !== -1 )
				{
					return {
						cameraPreset: 2,
						intro: 't_loadout_pistol_walkup',
						idle: 't_loadout_pistol_idle',
						animsList: [
							't_loadout_pistol_weightshift',
							't_loadout_pistol_lookat_pistol'
						]
					};
				}
				return {
					cameraPreset: 2,
					intro: 't_loadout_pistol_walkup',
					idle: 't_loadout_pistol_idle',
					animsList: [
						't_loadout_pistol_weightshift',
						't_loadout_pistol_lookat_pistol',
						't_loadout_pistol_slidepull',
						't_loadout_pistol_lookat_pistol02',
						't_loadout_pistol_headscratch',
						't_loadout_pistol_buttscratch'
					]
				};
			}

			if( loadoutSlot.indexOf( 'heavy') !== -1 )
			{
				if( weapon.indexOf( 'negev' ) !== -1 )
				{
				return {
					cameraPreset: 1,
					intro: 't_loadout_heavy_walkup',
					idle: 't_loadout_heavy_idle',
					animsList: [
						't_loadout_heavy_lookaround01',
						't_loadout_heavy_lookleft',
						't_loadout_heavy_lookaround02',
						't_loadout_heavy_hoist',
						't_loadout_heavy_lookatgun01',
						't_loadout_heavy_lookaround03'
					]
				};
			}
				if( weapon.indexOf( 'm249' ) !== -1 )
				{
				return {
					cameraPreset: 1,
					intro: 't_loadout_heavy_m249_walkup',
					idle: 't_loadout_heavy_m249_idle',
					animsList: [
						't_loadout_heavy_m249_lookaround01',
						't_loadout_heavy_m249_lookleft',
						't_loadout_heavy_m249_lookaround02',
						't_loadout_heavy_m249_hoist',
						't_loadout_heavy_m249_lookatgun01',
						't_loadout_heavy_m249_lookaround03'
					]
				};
			}
				if( weapon.indexOf( 'xm1014' ) !== -1 )
				{
				return {
					cameraPreset: 1,
					intro: 't_loadout_shotgun_xm_walkup',
					idle: 't_loadout_shotgun_xm_idle',
					animsList: [
						't_loadout_shotgun_xm_weightshift',
						't_loadout_shotgun_xm_lookat01',
						't_loadout_shotgun_xm_shrug',
						't_loadout_shotgun_xm_headcock',
						't_loadout_shotgun_xm_headgrab',
						't_loadout_shotgun_xm_bellyscratch',
						't_loadout_shotgun_xm_lookback'
					]
				};
			}			
				                           
				return {
					cameraPreset: 1,
					intro: 't_loadout_shotgun_walkup',
					idle: 't_loadout_shotgun_idle',
					animsList: [
						't_loadout_shotgun_weightshift',
						't_loadout_shotgun_lookat01',
						't_loadout_shotgun_shrug',
						't_loadout_shotgun_headcock',
						't_loadout_shotgun_headgrab',
						't_loadout_shotgun_bellyscratch',
						't_loadout_shotgun_lookback'
					]
				};
			}
			if( loadoutSlot.indexOf( 'rifle') !== -1 )
			{
				if( weapon.indexOf( 'awp' ) !== -1  || weapon.indexOf( 'galilar' ) !== -1  )
				{
					return {
						cameraPreset: 1,
						intro: 't_loadout_rifle02_walkup_awp_galil',
						idle: 't_loadout_rifle02_idle_awp_galil',
						animsList: [
							't_loadout_rifle02_weightshift_awp_galil',
							't_loadout_rifle02_lookback_awp_galil',
							't_loadout_rifle02_lookaround_awp_galil',
							't_loadout_rifle02_lookback02_awp_galil',
							't_loadout_rifle02_lookbatgun_awp_galil'
							]
						};
			    }
				
				if( weapon.indexOf( 'g3sg1' ) !== -1  ) 
				{				
					return {
						cameraPreset: 1,
						intro: 't_loadout_rifle02_walkup_g3sg',
						idle: 't_loadout_rifle02_idle_g3sg',
						animsList: [
							't_loadout_rifle02_weightshift_g3sg',
							't_loadout_rifle02_lookback_g3sg',
							't_loadout_rifle02_lookaround_g3sg',
							't_loadout_rifle02_lookback02_g3sg',
							't_loadout_rifle02_lookbatgun_g3sg'
							]
						};
				}
				
				          
				return {
					cameraPreset: 1,
					intro: 't_loadout_rifle02_walkup',
					idle: 't_loadout_rifle02_idle',
					animsList: [
						't_loadout_rifle02_weightshift',
						't_loadout_rifle02_lookback',
						't_loadout_rifle02_lookaround',
						't_loadout_rifle02_lookback02',
						't_loadout_rifle02_lookatgun'
						]
				};
			}
		}
	};

	return {
		SaveModelPanelSettingsToConvars : _SaveModelPanelSettingsToConvars.SaveSettings,
		StoreModelPanelSettingsForSaving : _SaveModelPanelSettingsToConvars.SetSettings,
		PlayAnimsOnPanel			: _PlayAnimsOnPanel,
		CancelScheduledAnim			: _CancelScheduledAnim,
		ItemHasCharacterAnims		: _ItemHasCharacterAnims,
		GetAnims					: _GetAnims
	};
})();