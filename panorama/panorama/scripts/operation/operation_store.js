'use strict';

var OperationStore = ( function() 
{
	var _m_cp = $.GetContextPanel();
	var _m_nSeasonAccess = null;
	var _oTileId = "id-op-store-tile-";
	var _m_tilesLoaded = false;
	var _m_placeBarSegments = false;
	
	var _Init = function()
	{
		_CheckUsersOperationStatus();

		                                                                                                                 
		_m_cp.FindChildInLayoutFile( 'id-op-store-get-more-points-btn' ).GetChild( 0 ).AddClass( 'op-store-progress__pass-upsell__text-btn-dark');
		_m_cp.FindChildInLayoutFile( 'id-store-pass-upsell-text-btn' ).GetChild( 0 ).AddClass( 'op-store-progress__pass-upsell__text-btn-dark');

		_m_cp.RemoveClass( 'op-store-tiles-hide' );
	};

	var _CheckUsersOperationStatus = function()
	{
		_m_nSeasonAccess = $.GetContextPanel().GetAttributeInt( "season_access", 0 );
		OperationUtil.ValidateOperationInfo( _m_nSeasonAccess );

		var oStatus = OperationUtil.GetOperationInfo();

		if( !OperationUtil.ValidateCoinAndSeasonIndex( _m_nSeasonAccess, oStatus.nCoinRank ) )
		{
			return;
		}

		_FillOutStoreTiles();

		var totalStarsAvailiable = OperationUtil.GettotalPointsFromAvailableFromMissions();
		_UpdateDialogVarYourStars();
		_UpdateProgressBar( totalStarsAvailiable );
		_SetPurchaseBtns( totalStarsAvailiable );
	};

	var _UpdateDialogVarYourStars = function()
	{
		                                                                                                                         
		_m_cp.SetDialogVariableInt( "your_stars", OperationUtil.GetOperationInfo().nRedeemableBalance );
	};

	var _UpdateProgressBar = function ( totalStarsAvailiable )
	{
		var elParent = _m_cp.FindChildInLayoutFile( 'id-op-store-progress-bar' );

		var aCoins = OperationUtil.GetCoinDefIdxArray();
		var numStarsEarned = OperationUtil.GetOperationInfo().nTierUnlocked;
		var nThreshold = 0;

		aCoins.forEach( function( coinId, index ){
			var id = InventoryAPI.GetFauxItemIDFromDefAndPaintIndex( coinId.toString(), 0 );

			var elCoin = elParent.FindChildInLayoutFile( "op-progress-coin" + index );

			if(! elCoin )
			{
				var elCoin = $.CreatePanel( "Panel", elParent , "op-progress-coin" + index );
				elCoin.BLoadLayoutSnippet( 'progressbar-icon' );
				elCoin.FindChildInLayoutFile('id-store-progress-bar-icon').itemid = id;
				elCoin.Data().upgradeThreshold = nThreshold;
			}

			                                           
			if( nThreshold > 0 )
			{
				elCoin.FindChildInLayoutFile('id-store-progress-bar-progress').SetDialogVariableInt( 'threshold', elCoin.Data().upgradeThreshold );
				var progress = numStarsEarned <= nThreshold ? numStarsEarned : nThreshold;
				elCoin.FindChildInLayoutFile('id-store-progress-bar-progress').SetDialogVariableInt( 'progress', progress );
			}
			else
			{
				elCoin.FindChildInLayoutFile('id-store-progress-bar-progress').text = '';
			}

			elCoin.SetHasClass( 'filled', nThreshold <= numStarsEarned );

			nThreshold = InventoryAPI.GetItemAttributeValue( id, 'upgrade threshold' );
	
		});

		                                                                                

		$.Schedule( .1, function() {
			var aCoinPanels = elParent.Children();
			var coinWidth = aCoinPanels[0].actuallayoutwidth/aCoinPanels[0].actualuiscale_x;
			var barWidth = elParent.actuallayoutwidth/elParent.actualuiscale_x;
			var segmentWidth = (barWidth - ( coinWidth * aCoins.length ))/totalStarsAvailiable - 1;
			var coinLevel = 0;

			                                     
			aCoinPanels[0].AddClass( 'filled' );
			for ( var i = 1; i < aCoinPanels.length; ++ i )
			{
				if( aCoinPanels[i].Data().upgradeThreshold <= numStarsEarned)
				{
					aCoinPanels[i].AddClass( 'filled' );
				}
			}

			                 
			for( var i = 0; i < totalStarsAvailiable; i++ )
			{
				var elBarSection =  elParent.FindChildInLayoutFile( "op-progress-pip" + i );
				
				if( !elBarSection )
				{
					var elBarSection = $.CreatePanel( 'Panel', elParent,  "op-progress-pip" + i );
					elBarSection.BLoadLayoutSnippet( 'progressbar-section' );
					elBarSection.style.width = segmentWidth +'px;';
				}
	
				elBarSection.SetHasClass( 'filled', i < numStarsEarned );

				if( i >= aCoinPanels[coinLevel].Data().upgradeThreshold )
				{
					++ coinLevel;
				}

				if ( !_m_placeBarSegments )
				{
					if( aCoinPanels[coinLevel] )
					{
						elParent.MoveChildBefore( elBarSection, aCoinPanels[coinLevel] );
					}
				}
	
			}

			if ( !_m_placeBarSegments )
			{
				$.Schedule( 0.1, function() { elParent.style.width = 'fit-children;' });
				_m_placeBarSegments = true;
			}
		});
	};

	var _FillOutStoreTiles = function ()
	{
		var aRewards = OperationUtil.GetRewardsData();

		aRewards.sort( function( a, b ) {                                       
			var cmpUiOrder = parseInt( a.uiOrder ) - parseInt( b.uiOrder );
			if ( cmpUiOrder != 0 )
				return cmpUiOrder;                      

			var cmpPoints = parseInt( a.points ) - parseInt( b.points );
			if ( cmpPoints != 0 || true )                                                         
				return a.idx - b.idx;                                                 

			return a.rnd - b.rnd;                                                
		} );

		var uiOrderRows = [ 0, -1, 0, 0 ];                             

		aRewards.forEach((reward, index) => {
			var uiOrder = parseInt( reward.uiOrder );
			var nItemRow = uiOrderRows[ uiOrder ];
			uiOrderRows[ uiOrder ] += 1;
			
			                                                                                                                                                                  
			var nActualRow = ( nItemRow >= 0 ) ? nItemRow : 0;
			var sExtraId = ( nItemRow >= 0 ) ? '' : ( '' + ( -nItemRow ) );
			var itemTileNameId = _oTileId + nActualRow + '' + uiOrder + sExtraId;
			var itemTile = _m_cp.FindChildInLayoutFile( itemTileNameId );
			itemTile.AddClass( 'op-store-item-tile-reward_ui_order' + uiOrder );
			itemTile.AddClass( 'op-store-item-tile-reward_ui_row' + nActualRow );

			var itemBtn = itemTile.FindChildInLayoutFile( 'id-op-store-item-tile-btn' );
			_MakeItemImages( itemTile, reward, index, itemBtn );

			var rewardId = reward.itempremium.ids[ 0 ];
			var itemName = itemTile.FindChildInLayoutFile( 'id-op-store-item-tile-name' );
			itemName.text = InventoryAPI.GetItemName( rewardId );

			itemBtn.SetPanelEvent( 'onactivate', _OpenInspect.bind( undefined, reward ) );
			itemBtn.FindChildInLayoutFile( 'id-op-store-item-cost').text = reward.points;
		});
	};

	var numBackGroundImages = 4;
	var currentImage = 0; 
	var _MakeItemImages = function ( itemTile, oReward, index, itemBtn )
	{
		var elParent = itemTile.FindChildInLayoutFile('id-op-store-item-tile-image');
		var randomRotate = false;

		currentImage++;
		_SetTileBackgroundImage( elParent, "store_bg_pixels" + currentImage );
		currentImage = ( currentImage === numBackGroundImages ) ? 1 : currentImage;

		if( oReward.containerType === 'isCharacterLootlist' )
		{
			_LoadCharactorImages( itemTile ,elParent, itemBtn, oReward );
			var color = ItemInfo.GetRarityColor( oReward.lootlist[0] );
			_SetBackgroundGradient( elParent, color, '#002456' );
		}
		else if( oReward.containerType === 'isWeaponLootlist' )
		{
			_LoadWeaponImages( elParent, oReward );
			_SetBackgroundGradient( elParent, '#291F0C90', '#291F0C' );
		}
		else if( oReward.containerType === 'isStickerLootlist' || oReward.containerType === 'isGraffitiBox' )
		{
			randomRotate = true;
			var aImagePanel = _SetMultiItemImages( elParent, oReward );

			if( oReward.containerType === 'isGraffitiBox' )
			{
				_TintGraffitiImages( aImagePanel );
			}
			_SetBackgroundGradient( elParent, '#291F0C90', '#291F0C' );
		}
		else
		{
			LoadItemImage( elParent, oReward.itempremium.ids[ 0 ], '', 'op-store-item-tile__image center' );
		}
	};

	var _LoadCharactorImages = function( itemTile, elParent, itemBtn, oReward )
	{
		var numImagesInPanel = 5;
		var charforModelIndex = 2;

		function LoadCharImageAndModel ( index, rewardId, isSmallCharTile )
		{
			var elImage = elParent.FindChildInLayoutFile( 'id-op-shop-tile-item' + index );

			if( !elImage && rewardId)
			{
				var cameraPreset = isSmallCharTile ? 20 : 19;
				{
					elImage = LoadItemImage( elParent, rewardId,
						'id-store-item-tile__item--char' + index, 
						'op-store-item-tile__item--char' + index 
						);

					if( index === charforModelIndex )
					{
						itemBtn.SetPanelEvent( 'onmouseover', _OnCharMouseover.bind( undefined, elParent, rewardId, elImage, cameraPreset) );
						itemBtn.SetPanelEvent( 'onmouseout', _OnCharMouseout.bind( undefined, elParent, elImage ) );
					}
					elImage.SetHasClass( 'small-char-tile', isSmallCharTile );
				}
			}
		}

		var isSmallCharTile = ( itemTile.GetAttributeString( 'data-type', '' ) === "char-small" ) ? true : false;

		if( oReward.lootlist.length === 1 )
		{
			                  
			LoadCharImageAndModel( 2, oReward.lootlist[ 0 ], isSmallCharTile );
		}
		else
		{
			for ( var i = 0; i < numImagesInPanel; i++ )
			{
				LoadCharImageAndModel( i, oReward.lootlist[ i ], isSmallCharTile );
			}
		}
	};

	var _LoadWeaponImages = function( elParent, oReward )
	{
		var elCollectionIcon = $.CreatePanel( "ItemImage", elParent , "id-op-store-item-tile__icon", {
			scaling: 'stretch-to-fit-preserve-aspect',
			class: 'op-store-item-tile__icon'
		});

		elCollectionIcon.itemid = oReward.itempremium.ids[ 0 ];
		
		var min = 0;
		var max = oReward.lootlist.length;
		var indexToDisplay = _GetRandomMinMax( min, max )
		var elImage = elParent.FindChildInLayoutFile( 'id-op-shop-tile-item' );

		if( !elImage )
		{
			elImage = LoadItemImage( elParent, 
				oReward.lootlist[ indexToDisplay ], 
				'id-op-shop-tile-item', 
				'op-store-item-tile__item op-store-item-tile__icon--weapon'
			);
			elParent.SetPanelEvent( 'onmouseover', function(){ InventoryAPI.PrecacheCustomMaterials( oReward.lootlist[0] );} );
		}
	};

	var _SetMultiItemImages = function( elParent, oReward )
	{
		var elMultiItemTile = $.CreatePanel( "Panel", elParent , "" );
		elMultiItemTile.BLoadLayoutSnippet( 'reward-sticker-images' );
		elMultiItemTile.style.zIndex = "2";
		var numItems = oReward.lootlist.length - 1;

		elMultiItemTile.Children().forEach( function( elImage, index )
		{
			var lootlistIndex = index % 2 === 0 ? ( numItems - index) : ( 0 + index );
			elImage.itemid = oReward.lootlist[ lootlistIndex ];
			elImage.Data().rewardId = oReward.lootlist[ lootlistIndex ];
		});

		return elMultiItemTile.Children();
	};

	var _TintGraffitiImages = function( aPanels )
	{
		if( aPanels.length > 0 )
		{
			aPanels.forEach( element => {
				                                                                                     
				                                                                             
				TintSprayIcon.CheckIsSprayAndTint( element.Data().rewardId, element );
				element.AddClass( 'noshadow' );
			});
			
		}
	};

	var LoadItemImage = function ( elParent, itemId, idName, styleName )
	{
		var elImage = $.CreatePanel( "ItemImage", elParent , idName, {
			scaling: 'stretch-to-fit-y-preserve-aspect',
			class: styleName
		});
		
		elImage.itemid = itemId;

		return elImage;
	};

	var _SetBackgroundGradient = function( itemTile, color, color2 )
	{
		if ( !color )
			return;
		
		itemTile.style.backgroundColor = 'gradient( linear, 0% 0%, 100% 0%, from( '+ color +'), to ( '+color2+' ) );';
	};

	var _SetTileBackgroundImage = function( elParent, imageName )
	{
		var elPanelBg = $.CreatePanel( "Image", elParent , "id-op-shop-tile-bg", { class: 'op-store-item-tile__bg'});
		elPanelBg.style.backgroundImage = "url( 'file://{images}/operations/op10/" + imageName+".png' );";
		elPanelBg.style.backgroundSize ='cover';
		elPanelBg.style.backgroundRepeat = 'no-repeat';
		elPanelBg.style.zIndex ='1';
	};

	var _OnCharMouseover = function( elParent, rewardId, rewardImage, cameraPreset )
	{
		var elPlayerModel = elParent.FindChildInLayoutFile( 'id-op-shop-tile-char-model' );
		if( !elPlayerModel )
		{
			elPlayerModel = $.CreatePanel( "ItemPreviewPanel", elParent , "id-op-shop-tile-char-model", { class: 'op-store-item-tile__char-model'});
			var model = ItemInfo.GetModelPathFromJSONOrAPI( rewardId );

			elPlayerModel.SetScene( "resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
				model,
				false
			);

			elPlayerModel.SetSceneIntroFOV( 20, 0 );
			var settings = ItemInfo.GetOrUpdateVanityCharacterSettings( rewardId, 'unowned' );
			settings.panel = elPlayerModel;

			elPlayerModel.SetCameraPreset( cameraPreset, false );
			elPlayerModel.SetHasClass( 'hide', true );

		}
		elPlayerModel.SetHasClass( 'hide', false );
		rewardImage.SetHasClass( 'hide', true );
	};

	var _OnCharMouseout = function( elParent, rewardImage ) 
	{
		elParent.FindChildInLayoutFile( 'id-op-shop-tile-char-model').SetHasClass( 'hide', true );
		rewardImage.SetHasClass( 'hide', false );
	};

	var _SetPurchaseBtns = function( totalStarsAvailiable )
	{
		var elUpSell = $.GetContextPanel().FindChildInLayoutFile( 'id-store-pass-upsell-text-btn' );
		var elGetStars = $.GetContextPanel().FindChildInLayoutFile( 'id-op-store-get-more-points-btn' );

		var oi = OperationUtil.GetOperationInfo();
		var bPremiumUser = oi.bPremiumUser;
		var sUserOwnedOperationPassItemID = InventoryAPI.GetActiveSeasonPassItemId();

		elUpSell.visible = !bPremiumUser;
		elGetStars.visible = oi.bShopIsFreeForAll ? true : bPremiumUser;
		elGetStars.SetPanelEvent( 'onactivate', OperationUtil.OpenUpSell.bind( undefined, 0, true ) );

		                          
		var elMissionsProgress = _m_cp.FindChildInLayoutFile( 'id-op-store-pass-missions-progress' );
		elMissionsProgress.visible= bPremiumUser;
		elMissionsProgress.SetDialogVariableInt( "mission_stars", bPremiumUser ? oi.nTierUnlocked : 0 );
		elMissionsProgress.SetDialogVariableInt( "max_stars", totalStarsAvailiable );

		if( bPremiumUser )
		{
			_m_cp.FindChildInLayoutFile( 'id-op-store-progress-pass-upsell' ).visible= false;
			elGetStars.SetPanelEvent( 'onactivate', OperationUtil.OpenUpSell.bind( undefined ) );
		}
		else
		{
			elUpSell.text = $.Localize( bPremiumUser ?
				'#op_get_more_stars' : sUserOwnedOperationPassItemID ? 
				'#SFUI_ConfirmBtn_ActivatePassNow' : '#op_get_premium'
				).toUpperCase();
	
			elUpSell.SetPanelEvent( 'onactivate', OperationUtil.OpenUpSell.bind( undefined ) );

			var descString = $.GetContextPanel().FindChildInLayoutFile( 'id-store-pass-upsell-desc' );
			descString.text = $.Localize( '#op_stars_max_upsell', elMissionsProgress );
		}

	
		                               
		  
		                                                                                                                 
		                                                                                                  
		                                                                                
		                      
		    
		   	                   
		   	                             
		   	                                                           
		   	                                      
		   	 
		   		                                                                 
		   			                                                                        
		   			  
		   		                                                             
		   		 
		   			                                                           
		   			                    
		   			 
		   				                       
		   			 
		   			    
		   			 
		   				                                  
		   				                                  
		   			 
		   			                                      

		   			                                                                           
		   			                                                                           
		   		 
		   	    
			
		   	                    
		   	 
		   		                                                                           
		   		                                                                                        
		   	 
		    
		                                                  
		   	                                        
		       
		   	                                   
	};

	var _OpenInspect = function( oReward )
	{
		                                                       

		UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/operation/operation_store_inspect.xml',
				'rewardid=' +oReward.itempremium.ids[ 0 ] +
				'&' + 'seasonaccess=' + _m_nSeasonAccess
			);
	};

	var _GetRandomMinMax = function( min, max)
	{
		return Math.floor(Math.random() * (max - min) + min);
	};

	var _OnInventoryUpdate = function()
	{
		OperationUtil.ValidateOperationInfo( _m_nSeasonAccess );

		var totalStarsAvailiable = OperationUtil.GettotalPointsFromAvailableFromMissions();
		_SetPurchaseBtns( totalStarsAvailiable );
		_UpdateDialogVarYourStars();
		_UpdateProgressBar( totalStarsAvailiable );
	};

	return {
		Init: _Init,
		CheckUsersOperationStatus: _CheckUsersOperationStatus,
		OnInventoryUpdate: _OnInventoryUpdate
	};
})();

(function () {
	var _m_cp = $.GetContextPanel();
	$.RegisterForUnhandledEvent( 'PanoramaComponent_MyPersona_InventoryUpdated', OperationStore.OnInventoryUpdate );
	$.RegisterForUnhandledEvent( 'UnblurOperationPanel', function(){ OperationUtil.UnblurMenu( _m_cp); } );
	$.RegisterForUnhandledEvent( 'BlurOperationPanel', function(){ OperationUtil.BlurMenu( _m_cp); } );
})();



                                    
    
   	                                
   	                     
   	                                  
   	                                      
   	                              
   	                            

   	                      
   	 
   		                               
   		                           
   		                             

   		                                     
   		                                                    
   		 
   			                                           
   		 
   		                                                  
   	  

   	                                           
   	 
   		                                                                             

   		                                                        
   		                                               

   		                               
   			                    
   			                           
   			                                  
   			                            
   		 
   			       
   		 

   		                          
   		                        

   		                                                                
   		                                                                                   
   		                                            

   		                                         
   		                                                     

   		                        
   		                     

   		                                                                
   			                                        
   			                                       
   		  

   		                                                         
   		                                                                         
		
   		                                                                    
   		                                                                

   		                                                                 
   		                                                                
		
   		                                                                                               
   		                        

   		                                                 
   			                                                                                          
   			                                                     
   		       
		
   		                                       
   		                                
   		                          

   		                                                                                                                    
   		                                       
   		                  
   	  

   	                                      
   	 
   		                           
   		 
   			                                                                                 
   		 

   		                                                                                                
   		                                                                                                         
   	  

   	                                 
   	 
   		                                                                             

   		                                                                 
   		                                                                             
   		                                                    

   		                                                                                          
   			                                                       
   			                                                      
   			                

   		                            
   			                                             
   			                                      
		
   		                                                                             
   		                                                                                   

   		  
   		                               
   		  
   		                                                                                                              
   		                                                                                               
   		                                                                             
   		                   
   		 
   			                   
   			                             
   			                                                           
   			                                      
   			 
   				                                                                 
   					                                                                        
   					  
   				                                                             
   				 
   					                                                           
   					                    
   					 
   						                       
   					 
   					    
   					 
   						                                  
   						                                  
   					 
   					                                      

   					                                                                           
   					                                                                           
   				 
   			    
			
   			                    
   			 
   				                                                                           
   				                                                                                        
   			 
   		 
   		                                               
   			                                        
   		    
   			                                   
   	  

   	                                                                       
   	 
   		                     
   			                                     
   			                
   			             
   		  

   		                                    
   		                                                
   		                                                         
   		                                                                                                                                                     
   		                                                    
   		                                                 
   		                                                                         
   		                                                                                                   
   		                                                                                                                   

   		                                                                
		
   		                                                                  
   		                                        
   	  

   	                        
   	                        
   	                        
   	                                     
   	 
   		                                   

   		                        
   		 
   			       
   		 

   		                                                                                 
   		 
   			                                                                    
   			               
   			 
   				                                                                    

   				                    
   				 
   					                                            
   				 
   			 
			
   			               
   		 
   		                                                                   
   		                                                                      
   		                   
   		                  
   		                   

   		                                    
   		 
   			                                                            
   			                                                                                         
   			                               
   			 
   				                        
   				                                                                                   
   				                                                                
   				                                              

   				                                                                            
   				                                        
   			 

   			                                                                                            

   			                       
   			 
   				                                     
   				                    
   				 
   					                       
   				 
   				       
   			 

   			                                      
   			                                             
   			 
   				                                                                                                                                     
   			 
   			    
   			 
   				                                                                                   
   			 

   			                                                
   			                                                                                                            
   			                                                                                                 

   			                                                                                                                                
   			                                                     
   			                                                                                     
   			                                                                                                                                                              
   			                                                                                

   			                                                       
   		 
   	  

   	                                    
   	 
   		                                              
   		                

   		                                                                      
   			                                                          
   			     
   		 
   			                                     
   			 
   				                                                  

   				                                                                     

   				                          
   				 
   					                                                                                
   				     
   				 
   					              
   						                   
   						                                       
   							                                                                          
   							                                                                        
   							                                          
   					    
   				 
   			 
   		 
   		                                                                                                                            
   		              
   	  

   	                        
   	                        
   	                       
   	                                             
   	 
   		                                                              
   			                                                                     
   			                                                                     
   			                                                                 
   			                                                                 
   			                                                                 
   			                                        
   			               
   			                   
   		    
		
   		                                                

   		                                                                         
   		                                                                         
   	  

   	                                        
   	 
   			                                                                        
   			 

   				                                                             
   				 
   					                                
   					                                        
   					                               
   						                                                                                                    
   					 
   						                     
   						                                

   						                                                                                                                      
   						                                                               

   						                                                                         
   						                                                                            
   						                                       
   						                          
   						                                     
			
   						                                                                                                                    
   						                      
   					 
   				 

   				                                                           
   				 
   					                                       
   					                                                       
   					 
   						                                   
   					 
   				 
   				             
   			  

   			                                                                                             
   	  

   	                   
   	                   
   	                   
   	                                                                 
   	 
   		                            
   		 
   			                                                                            
   			                                                                                           

   			                                                                                                  

   			                   
   			                          
   			                                               
   		 
		
   		             
   		 
   			                    
   			                    
   			                                                                              
   		 
   		    
   		 
   			                    
   			                    
   			                                                                              
   		 
   		                                        
   	  

   	                                                       
   	 
   		                                                     
   		                                                                                

   		                                                                         
   		                                                                        
   		                                                                        
   	  

   	                                                               
   	 
   		                                                                  
   		                                        
		
   		                                                                                
   		                                

   		                                                                                          
   		 
   			                                                                    
   			                                                      
   			                                                                                                     
   		 
   	  

   	                                                                              
   	 
   		                                              

   		                                                           
   		 
   			       
   		 

   		                                                                                    
   	  

   	                                                 
   	 
   		                                                                             

   		                
   		 
   			                                    
   		 
   	  

   	                                                              
   	 
   		                                                                                         
   		                                              
   		                            

   		                                  
   		 
   			                                          
   		 

   		                                                                                        
   		 
   			                                                        
   			 
   				                                                            
   				                     
   			 
   		 

   		                 
   	  

   	                                   
   	 
   		                                                 
   		                                                                        
   			                                                                          
   			                                                                      
   		  
		
   		                          
   	  

   	                                                                                                       
   	 
   		                                                                                  
   		                                           

   		                                                    
   		 
   			                                                                                  
   			                                                                         

   			                
   			 
   				                                                                                                                   
   				                                                    
   				                 
   				                                        
   				                                 
   			 

   			                                                                                                          
   			                                                       
   			                                                                                          
   			                                                
   			 
   				                                 

   				                                       
   				 
   					                                    
   				 
   			 

   			                                
   			 
   				                                                                                                                                      
   			 
   			    
   			 
   				                                                                                                        
   			 
	
   			                                                                
   			                                                                                  
   				             
   				                     
   					          
   					         
   					     
   				    
			
   			                 
   				                
   				           
   				                
   				                    
   			  

   			                                                               
			
   			                                                                                           
   			                                                                                                                             
   			                                                                                                    
			
   			                        
   			 
   				                                                                       
   				 
   					                                  
   						                                    
   					  
   				 
   				    
   				 
   					                                  
   						                                                                      
   					  
   				 
   			 

   			                                                                                                         

   			                
   			 
   				                                                                              
   			 
   		    
   	  

   	                                                        
   	 
   		                                                                                                
   		                                                                                   
   		                                              

   		                                                                                                                            
   			                                
		
   		                                                                                               

   		                          
   		 
   			                                                                           
   		 
   	  

   	                          
   	                          
   	                          
   	                                                                                   
   	 
   		                                        
   		 
   			       
   		 
		
   		                               

   		                        
   			                                                     
   				                                        
   				                                       
   			  

   		                                          

   		                                                 
   		 
   			                          
   		 

   		                                
		
   		                                                               
   		                                      

   		                                               
   		                  
   		 
   			                                                         
   			 
   				                                                                                                                 
   			 
   			    
   			 
   				                                                                                                            
   			 
   		 
   	  

   	                                             
   	 
   		                         
   		 
   			                                   
   		 
		
   		                          
   		                                
   		                                                                                 
   	  

   	                                        
   	 
   		                                                                                                                      
   		                              
   			                             
   				                                                               
   					                                                    
   			 
   		   
   	  

   	                                              
   	 
   		                                                                                    

   		                                 
   			                                                                                              
   			                                                                                            
		
   		                                              
		
   		            
   		 
   			                                                                                                                 
   			                                                                  
   			                                       
   			                                          
   				                              
   					          
   					           
   			    
   		 
   	  

   	                  
   	                  
   	                  
   	                                    
   	 
   		                          
   		 
   			       
   		 

   		                                                                                

   		                                                                      
   		                                                                                                                                     

   		                   
   		                                                                                       
   		                                             
   		                                                  
   		                                                                                                 

   		                                                    
   		                                            
   		                                   

   		                                                                                      
   		             
   		 
   			             
   			 
   				                                                      
   				 
   					                                             
   						   
   						                                                                  
   						                             
   						                          
   						                                  
   						                                  
   						                               
   					  
   				   
   				                                                       
   				 	                                                                                                        
   				   
   			 
   		 
   		    
   		 
   			                                                  
			
   			             
   			 
   				                           
   			 
   			    
   			 
   				                                 
   				 
   					                                                                  
   				 
   			 

   			                                                                              
   			 
   				                                                    
   					                    
   					                                                                                  
   					                      
   					 
   						                                                        
   					 
   					                  
   				  

   				                                                      
   				 
   					                                                     
   					                                             
   						   
   						                                                               
   						                        
   						                          
   						                         
   						                         
   						                                 
   						                           
   						      
   					  
   				   
   				                                                       
   				 
   					                                                     
   					                                                                                             
   					                                                                         
   				   
   			 
   		 

   		                                                                                                               

   		                        
   			              
   			                 
   				        
   			   

   		                                                                               

   		                                 
   		                                                    
   	  

   	                                                            
   	 
   		                                                                            
   		                                                                                            
   		                                                

   		                   
   		 
   			       
   		 

   		                     
   		              
   		 
   			                                                  
   			                                                                                      

   			                                                                                  
   			                                                                              
   			 
   				                                        
   				       
   			 

   			                                                                                                
   			                                                                      

   			                                                                                                                     
   			                                                         
   			                                                                       
   		 
   		    
   		 
   			                                                          
   		 

   		                             
   	  

   	                                               
   	 
   		                                                                        
   		                                 

   		                                                                         
   		                                          
   		 
   			       
   		 

   		                                            
   		 
   			                          
   				              
   				       
   				                          
   					                                        
   					                 
   				 
   			  

   			              
   				            
   				      
   				     
   					               
   					                                          
   				 
   			  

   			              
   				        
   				      
   				                  
   					                                              
   				 
   			  

   			                             

   			                                
   			 
   				                      
   			 

   			                                                                                                                 

   			                                                 
   				           
   				                                  
		
   			                                  
   			 
   				                                                                             
   			 

   			                  
   			 
   				                                                                             
   			 
   			                            
   		    
   	  

   	                                  
   	 
   		                                                             
   			                                                      
   			      
   			      
   	  

   	                                                        
   	 
   		                                                       
   		 
   			       
   		 
		
   		                                                   
   		                                         
   		                                                                                 
   	  

   	                                                               
   	 	
   		                                           
   			              
   			                  
   		  

   		                                            
   		                                                                                   
   		                                         
   	  

   	                                         
   	 	 	
   		                                                                  
   			                                                                         
   			                                                                         
   			                                                                       
   			                                                                       
   			                                                                       
   			                                 
   			               
   			                   
   		    
		
   		                                                    
   	  

   	                                                          
   	 
   		                                                                        
   		                                      

   		                            
   		 
   			                                                                                                      
   			                       

   			                                                    
   			 
   				                                      
   			 
   			    
   			 
   				                                                                                        
   				                                     
   				                                                                                    
	
   				                                                                                  
   				                      
   				 
   					                                          
   				 
   			 

   			                                                                               
   		 
		
   		             
   		 
   			                    
   			                    
   			                                                                                  
   			                                                         
   				                                                                   
   		 
   		    
   		 
   			                    
   			                    
   			                                                                                  
   			                                                         
   				                                                                   
   		 

   		                                                                                 

   		                                                                   
   		                                                                   
   		                                                     
   		                                                                                

   		                                                       
   		 
   			                                                                                                        
   		 

   		                                                       
   		 
   			                                                                                                        
   		 
   	  
	
   	                                                             
   	 
   		                                                                        
   		                                                                        

   		                         
   		                        
	
   		                        
   		                       
   		                                                                                        
   		 
   			                                                         
   		 
   		    
   		 
   			                                                                             
   		 
		
   		                                                                
   		                                                     
   		 
   			                       
   			                                                                         
   				      
   				     
   			  

   			                                                    
   			                                                

   			                  
   			 
   				                                                                                       
   				                         
   				                                               

   				                                            
   				                                       
   				                                               
   				                               
   				                                            
   		  		                                 
   				                                       
   				                                                             
   				                                                   
   				                                                
   				                                               
   				                                              
				
   				          
   				                                      
   				                                                     
   				                                                                        
   			 
   			    
   			 
   				                                        
   			 
   		 
   		    
   		 
   			                       
   			                                                                                                    
   		 
   	 
	
   	                                 
   	 
   		                                           
   	  

   	                                                                         
   	 
   		              
   		                     
   		 
   			                                        
   		 

   		                                  
   		 
   			                                                                                  
   			                                       
   			 
   				                                                                                    
   			 
   		 
   	  

   	                            
   	 
   		                                   
   	  

   	                          
   	 
   		                                  
   	  

   	        
   		            
   		                                                      
   		                        
   		                   
   	  
         

                 
   	                                                                                                                       
   	                                                                                
   	                                                                            
        

