              
   
                                                            
'use strict';

var ItemTile = ( function()
{
	var _OnTileUpdated = function()
	{
		var id = $.GetContextPanel().GetAttributeString( 'itemid', '0' );

		if ( id === '0' )
			return;

		_SetItemName( id );
		_SetItemRarity( id );
		_SetEquippedState( id );
		_SetStickers( id );
		_SetRecentLabel( id );
		_TintSprayImage( id );
		_DisableTile( id );

		                                                               
		                                                       
		var loadImage = $.GetContextPanel().GetAttributeString( 'loadimage', '' );

		if ( loadImage )
		{
			_SetImage( id );
		}

		                                                 
	};

	                                                                                                    
	                                                                       
	                                                                                                    
	var _SetItemName = function( id )
	{
		var name = ItemInfo.GetName( id );
		$( '#JsItemName' ).text = FormatText.GetInventoryDisplayStringFromName( name );
	};

	                             
	    
	   	                                                                   
	     

	var _SetImage = function( id )
	{
		$.GetContextPanel().FindChildInLayoutFile( 'ItemImage' ).itemid = id;
	};

	var _SetItemRarity = function( id )
	{
		$.GetContextPanel().FindChildInLayoutFile( 'JsRarity' ).style.backgroundColor = ItemInfo.GetRarityColor( id );
	};

	var _SetEquippedState = function( id )
	{
		var subSlot = ItemInfo.GetSlotSubPosition( id );
		var elCtDot = $.GetContextPanel().FindChildInLayoutFile( 'ItemEquipped-ct' );
		var elTDot = $.GetContextPanel().FindChildInLayoutFile( 'ItemEquipped-t' );
		elTDot.AddClass( 'hidden' );
		elCtDot.AddClass( 'hidden' );
		elTDot.RemoveClass( 'item-tile__equipped__radiodot--filled' );
		elCtDot.RemoveClass( 'item-tile__equipped__radiodot--filled' );

		                                                       
		                                                                    

		                                             
		if ( ItemInfo.IsEquippedForNoTeam( id ) && ( subSlot === 'flair0' || subSlot === 'musickit' || subSlot === 'spray0' ) )
		{
			elCtDot.RemoveClass( 'hidden' );
			elCtDot.AddClass( 'item-tile__equipped__radiodot--filled' );
			return;
		}

		if ( ItemInfo.IsItemAnyTeam( id ) )
		{
			if ( ItemInfo.IsEquippedForCT( id ) )
			{
				elCtDot.AddClass( 'item-tile__equipped__radiodot--filled' );

				elTDot.RemoveClass( 'hidden' );
				elCtDot.RemoveClass( 'hidden' );
			}

			if ( ItemInfo.IsEquippedForT( id ) )
			{
				elTDot.AddClass( 'item-tile__equipped__radiodot--filled' );

				elTDot.RemoveClass( 'hidden' );
				elCtDot.RemoveClass( 'hidden' );
			}
			return;
		}

		if ( ItemInfo.IsEquippedForCT( id ) )
		{
			elCtDot.RemoveClass( 'hidden' );
			elCtDot.AddClass( 'item-tile__equipped__radiodot--filled' );
			return;
		} else if ( ItemInfo.IsEquippedForT( id ) )
		{
			elTDot.RemoveClass( 'hidden' );
			elTDot.AddClass( 'item-tile__equipped__radiodot--filled' );
			return;
		}
	};

	var _SetStickers = function( id )
	{
		var listStickers = ItemInfo.GetitemStickerList( id );
		var elParent = $.GetContextPanel().FindChildInLayoutFile( 'StickersOnWeapon' );
		elParent.RemoveAndDeleteChildren();

		if ( listStickers.length > 0 )
		{
			listStickers.forEach( function( entry )
			{
				                                  
				$.CreatePanel( 'Image', elParent, 'ItemImage' + entry.image, {
					src: 'file://{images_econ}' + entry.image + '.png',
					scaling: 'stretch-to-fit-preserve-aspect',
					class: 'item-tile__stickers__image'
				} );
			} );
		}
	};

	var _SetRecentLabel = function( id )
	{
		var isRecentValue = InventoryAPI.GetItemSessionPropertyValue( id, 'recent' );
		var isUpdatedValue = InventoryAPI.GetItemSessionPropertyValue( id, 'updated' );
		var elPanel = $.GetContextPanel().FindChildInLayoutFile( 'JsRecent' );

		if ( isUpdatedValue === '1' || isRecentValue === '1' )
		{
			var locString = ( isRecentValue === '1' ) ? '#inv_session_prop_recent' : '#inv_session_prop_updated';
			
			elPanel.RemoveClass( 'hidden' );
			elPanel.text = $.Localize( locString );
			return;
		}

		elPanel.AddClass( 'hidden' );
	};

	var _TintSprayImage = function( id )
	{
		if ( ItemInfo.ItemMatchDefName( id, 'spraypaint' ) || ItemInfo.ItemMatchDefName( id, 'spray' ) )
		{
			InventoryAPI.GetSprayTintColorCode( id );

			var colorTint = InventoryAPI.GetSprayTintColorCode( id );
			
			if ( colorTint )
			{
				$.GetContextPanel().FindChildInLayoutFile( 'ItemImage' ).style.washColor = colorTint;
			}
			else
			{
				$.GetContextPanel().FindChildInLayoutFile( 'ItemImage' ).style.washColor = 'none';
			}
		}
		else
		{
			$.GetContextPanel().FindChildInLayoutFile( 'ItemImage' ).style.washColor = 'none';
		}
	};

	var _DisableTile = function( id )
	{
		var capabilityInfo = _GetPopUpCapability();

		if ( capabilityInfo &&
			capabilityInfo.capability === 'can_sticker' &&
			!ItemInfo.ItemMatchDefName( id, 'sticker' ) )
		{
			$.GetContextPanel().enabled = ( ItemInfo.GetStickerSlotCount( id ) > ItemInfo.GetStickerCount( id ) );
		}
	};

	var _OnActivate = function()
	{
		var id = $.GetContextPanel().GetAttributeString( 'itemid', '0' );
		                                       

		                                                
		var capabilityInfo = _GetPopUpCapability();
		if ( capabilityInfo )
		{
			$.DispatchEvent( 'PlaySoundEffect', 'inventory_item_select', 'MOUSE' );
				                                 
			InventoryAPI.PrecacheCustomMaterials( id );

			if ( capabilityInfo.capability === 'nameable' )
			{
				_CapabilityNameableAction( SortIdsIntoToolAndItemID( id, capabilityInfo.initialItemId ) );
			}
			else if ( capabilityInfo.capability === 'can_sticker' )
			{
				_CapabilityCanStickerAction( SortIdsIntoToolAndItemID( id, capabilityInfo.initialItemId ) );
			}
			else if ( capabilityInfo.capability === 'decodable' )
			{
				_CapabilityDecodableAction( SortIdsIntoToolAndItemID( id, capabilityInfo.initialItemId ) );
			}
			else if ( capabilityInfo.capability === 'can_stattrack_swap' )
			{
				_CapabilityStatTrakSwapAction( capabilityInfo, id );
			}

			return;
		}

		                        
		var filterValue = $.GetContextPanel().GetAttributeString( 'context_menu_filter', null );
		var filterForContextMenuEntries = filterValue ? '&populatefiltertext=' + filterValue : '';
		                                    
		var contextMenuPanel = UiToolkitAPI.ShowCustomLayoutContextMenuParametersDismissEvent(
			'',
			'',
			'file://{resources}/layout/context_menus/context_menu_inventory_item.xml',
			'itemid=' + id + filterForContextMenuEntries,
			function()
			{
			}
		);
		contextMenuPanel.AddClass( "ContextMenu_NoArrow" );
	};

	var _GetPopUpCapability = function()
	{
		if ( typeof InventoryPanel === "object" )                                                                 
		{
			var capInfo = InventoryPanel.GetCapabilityInfo();
			if ( capInfo.popupVisible )	
			{
				return capInfo;
			}
		}

		return null;
	};

	var SortIdsIntoToolAndItemID = function( id, initalId )
	{
		var toolId = InventoryAPI.IsTool( id ) ? id : initalId;
		var itemID = InventoryAPI.IsTool( id ) ? initalId : id;

		                                                 
		                                                      

		return {
			tool: toolId,
			item: itemID
		};
	};

	var _CapabilityNameableAction = function( idsToUse )
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_capability_nameable.xml',
			'nametag-and-itemtoname=' + idsToUse.tool + ',' + idsToUse.item +
			'&' + 'asyncworktype=nameable'
		);
	};

	var _CapabilityCanStickerAction = function( idsToUse )
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_capability_can_sticker.xml',
			'sticker-and-itemtosticker=' + idsToUse.tool + ',' + idsToUse.item +
			'&' + 'asyncworktype=can_sticker'
		);
	};

	var _CapabilityDecodableAction = function( idsToUse )
	{
		UiToolkitAPI.ShowCustomLayoutPopupParameters(
			'',
			'file://{resources}/layout/popups/popup_capability_decodable.xml',
			'key-and-case=' + idsToUse.tool + ',' + idsToUse.item +
			'&' + 'asyncworktype=decodeable'
		);
	};

	var _CapabilityStatTrakSwapAction = function( capInfo, id )
	{
		                                                  
		                                                                                          
		                                                                                                    
		if ( InventoryAPI.IsTool( capInfo.initialItemId ) )
		{
			$.DispatchEvent( "ShowSelectItemForCapabilityPopup", 'can_stattrack_swap', id, capInfo.initialItemId );
		}
		else
		{
			                               
			                                           
			                                          
			                        
			UiToolkitAPI.ShowCustomLayoutPopupParameters(
				'',
				'file://{resources}/layout/popups/popup_capability_can_stattrack_swap.xml',
				'swaptool=' + capInfo.secondaryItemId +
				'&' + 'swapitem1=' + capInfo.initialItemId +
				'&' + 'swapitem2=' + id
			);
		}
	};

	var _Ondblclick = function()
	{
		                     
		var id = $.GetContextPanel().GetAttributeString( 'itemid', '0' );
		                                       

		if ( ItemInfo.GetSlotSubPosition( id ) || ItemInfo.ItemMatchDefName( id, 'sticker' ) )
		{
			$.DispatchEvent( "InventoryItemPreview", id );
			$.DispatchEvent( 'ContextMenuEvent', '' );
		}
	}

	var _ShowTooltip = function()
	{
		var id = $.GetContextPanel().GetAttributeString( 'itemid', '0' );

		if ( !InventoryAPI.IsItemInfoValid( id ) )
		{
			return;
		}

		UiToolkitAPI.ShowCustomLayoutParametersTooltip(
			'ItemImage',
			'JsItemTooltip',
			'file://{resources}/layout/tooltips/tooltip_inventory_item.xml',
			'itemid=' + id
		);
	};

	var _HideTooltip = function()
	{
		UiToolkitAPI.HideCustomLayoutTooltip( 'JsItemTooltip' );
	};

	return {
		OnTileUpdated	: _OnTileUpdated,
		OnActivate		: _OnActivate,
		ShowTooltip		: _ShowTooltip,
		HideTooltip		: _HideTooltip,
		Ondblclick		: _Ondblclick
	};
} )();


                                                                                                    
                                           
                                                                                                    
( function()
{
	$.RegisterEventHandler( 'CSGOInventoryItemLoaded', $.GetContextPanel(), ItemTile.OnTileUpdated );
} )();






                                       
                                                                                                         

                                      
    
   	                             

   	             
   	    
   	   	                                          
   	   	                                                                                 
   	   	                                                                                                                                        
   	   	       
   	    

   	                                                
    

                            
    
   	                                                                                 
   	                                                
    

                         
    
   	                                                               
    

                                
    
   	                               

   	                                               
   		            
   		                 
   		                                                                
   		                        
   	  
    

                         
    
   	                                                        

   	                                     
   	   
   		                                            
   		                               
   	   
    




                                                                                                    
                                    
                                                                                                    
                                
   	                                                             
    

                                         
   	                                        
    

                                 
    
   	                                                                                 
   	 
   		                         
   		                                                    
   		                                                                    
   		                                                  
   		                                                   
   		                                                   
		
   		                             
   			                                      
   		                     
   			                                        
   		    
   			                                   
   	 
	
   	             
    

           

   	             	                
     

                                                   
                                
                                 
    
   	                                 
   	 
   		                                                                
   	 
		
   	                                                                                                       
    

                                                                  
                                 
                          
    
   	                                 
   	 	
   		                                                                      
   		                        
   		                                           
   	 

   	                     
    

                                        
    
   	                     

   	                           	
   	                                              
   		                                              
	
   	                        
   	 
   		                                   

   		                        
   			             
   	 
		
   	                                      
    
