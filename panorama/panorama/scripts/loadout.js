'use strict';

var Loadout = ( function() {

	var _Init = function()
	{
		$.GetContextPanel().FindChildInLayoutFile( 'LoadoutTeamCt' ).checked = true;
		$.GetContextPanel().FindChildInLayoutFile( 'LoadoutPistols' ).checked = true;
		_AddSort();
		_HideShowSingleItem( true );
		_ShowItemsForSelectedSlot();
	};

	var _AddSort = function()
	{
		var elDropdown = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSortDropdown' );
		var count = InventoryAPI.GetSortMethodsCount();

		for ( var i = 0; i < count; i++ ) 
		{
			var sort = InventoryAPI.GetSortMethodByIndex( i );
			var newEntry = $.CreatePanel( 'Label', elDropdown, sort, {
				class: 'DropDownMenu'
			} );

			newEntry.text = $.Localize( '#' + sort );
			elDropdown.AddOption( newEntry );
		}

		                        
		elDropdown.SetSelected( InventoryAPI.GetSortMethodByIndex( 1 ) );

	};

	var _HideShowRadialLoadout = function( bShow )
	{
		$.GetContextPanel().FindChildInLayoutFile( 'LoadoutRadialSelector' ).SetHasClass( 'hidden', !bShow ) ;
	};
	
	var _ShowRadialLoadout = function( )
	{
		_HideShowRadialLoadout( true );
		_HideShowSingleItem( false );
		_ShouldShowTeamData();
	};

	                                                                                                    
	                     
	                                                                                                    
	var _ShowSingleSlotLoadout = function()
	{
		_HideShowRadialLoadout( false );
		_HideShowSingleItem( true );
		_UpdateSingleItem();
		_ShouldShowTeamData();
	};

	var _HideShowSingleItem = function( bShow )
	{
		$.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItem' ).SetHasClass( 'hidden', !bShow );
	};

	var _UpdateSingleItem = function()
	{
		var loadoutSlot = _GetSelectededLoadoutSlot();
		var team = '';

		if ( _SlotHasNoTeamAsTeam( loadoutSlot ) )
		{
			team = 'noteam';
		}
		else
		{
			team = _GetSelectededTeam() === "3" ? 'ct' : 't';
		}
		
		var elModel = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItemModel' );
		var itemId = LoadoutAPI.GetItemID( team, loadoutSlot );

		_FillOutItemData( itemId, loadoutSlot );
		_UpdateItemList();
	};

	var _FillOutItemData = function( itemId, loadoutSlot )
	{
		var elModel = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItemModel' );
		var elTitle = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItemLabel' );
		var elRarity = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSingleItemRarity' );

		var noIdEquipped = ( itemId === '0' ) ? true : false;
		elModel.SetHasClass( 'hidden', noIdEquipped );
		elRarity.SetHasClass( 'hidden', noIdEquipped );

		_ShowFlairReset( loadoutSlot, noIdEquipped );

		if ( noIdEquipped )
		{
			elTitle.text = $.Localize( '#inv_empty_loadout_slot' );
			return;
		}
		
		var modelPath = ItemInfo.GetModelPathFromJSONOrAPI( itemId );
		
		                                                  
		elModel.SetScene( "resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
			modelPath,
			false
		);

		elTitle.text = ItemInfo.GetName( itemId );
		elRarity.style.backgroundColor = ItemInfo.GetRarityColor( itemId );
	};

	var _ShowFlairReset = function( loadoutSlot, noIdEquipped )
	{
		var elClearBtn = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutResetFlair' );
		elClearBtn.SetHasClass( 'hidden', ( noIdEquipped || loadoutSlot !== 'flair0' ) );
	};

	var _ResetFlair = function()
	{
		var loadoutSlot = 'flair0';
		var team = 'noteam';
		var defaultItem = LoadoutAPI.GetDefaultItem( team, loadoutSlot );

		if ( defaultItem !== LoadoutAPI.GetItemID( team, loadoutSlot ) )
		{
			LoadoutAPI.EquipItemInSlot( team, defaultItem, loadoutSlot );
		}
	};
	
	                                                                                                        

	var _UpdateItemList= function()
	{
		var loadoutSlot = _GetUsesWedges() ? _GetSelectededRadialButton() : _GetSelectededLoadoutSlot();
		var elListerToUpdate = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutItemList' );
		var elDropdown = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSortDropdown' );
		var sortType = elDropdown.GetSelected().id;

		var szMainFilter = 'inv_group_equipment';
		switch ( loadoutSlot )
		{
			case 'flair0':
				szMainFilter = 'inv_display_slot';
				break;
			case 'spray0':
				szMainFilter = 'inv_graphic_art';
				break;
		}

		$.DispatchEvent( 'SetInventoryFilter',
			elListerToUpdate,
			szMainFilter,
			'any',
			'any',
			sortType,
			loadoutSlot,
			''               
		);

		_ShowHideNoItemsMessage( elListerToUpdate );
	};

	                                                                                               
	                                                                                                                      
	var _ShowHideNoItemsMessage = function( elLister )
	{
		var count = elLister.count;
		var elParent = elLister.GetParent();

		var elEmpty = elParent.FindChildInLayoutFile( 'LoadoutEmptyLister' );

		if ( count > 0 )
		{
			if ( elEmpty )
			{
				elEmpty.AddClass( 'hidden' );
			}
			return;
		}

		elEmpty.RemoveClass( 'hidden' );
		var elLabel = elEmpty.FindChildInLayoutFile( 'LoadoutEmptyListerLabel' );
		elLabel.text = $.Localize( '#inv_empty_lister_general');
	};

	                                                                                                    
	          
	                                                                                                    
	var _GetSelectedTab = function()
	{
		var elSlots = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSlotSelectionRadios' );
		var elSelectedSlot = elSlots.Children().filter( slot => slot.checked === true );
		return elSelectedSlot[ 0 ];
	}	
	
	var _GetSelectededLoadoutSlot = function()
	{
		return _GetSelectedTab().GetAttributeString( 'data-slot', '' );
	};

	var _GetUsesWedges= function()
	{
		return _GetSelectedTab().GetAttributeString( 'data-wedge', '' ) === 'true' ? true : false;
	};

	var _GetSelectededRadialButton = function()
	{
		var elWedges = $.GetContextPanel().FindChildInLayoutFile( 'ItemWheel' );
		var wedgeList = elWedges.Children().filter( wedge => wedge.checked === true );
		return wedgeList[0].GetAttributeString( 'equip_slot', '' );
	}	

	var _GetSelectededTeam = function()
	{
		var elTeams = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSelectTeam' );
		var elSelectedTeam = elTeams.Children().filter( slot => slot.checked === true );
		return elSelectedTeam[ 0 ].GetAttributeString( 'data-team', '' );
	};

	var _SlotHasNoTeamAsTeam = function( loadoutSlot )
	{
		if ( loadoutSlot === 'spray0' ||
			loadoutSlot === 'musickit' ||
			loadoutSlot === 'flair0' )
		{
			return true;
		}

		return false;
	};

	var _ShouldShowTeamData = function()
	{
		var elTeams = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSelectTeam' );
		var loadoutSlot = _GetSelectededLoadoutSlot();
		var team = _GetSelectededTeam();

		if ( _SlotHasNoTeamAsTeam( loadoutSlot ) )
		{
			elTeams.visible = false;
		}
		else
		{
			elTeams.visible = true;
		}
	};

	                                                                                                    
	var _ShowItemsForSelectedSlot = function()
	{
		                           
		if ( _GetUsesWedges() )
		{
			$.DispatchEvent( "ShowLoadout", _GetSelectededLoadoutSlot(), Number( _GetSelectededTeam() ) );

			var wedges = $.GetContextPanel().FindChildInLayoutFile( 'ItemWheel' ).Children();
			$.DispatchEvent( "Activated", wedges[ 0 ], "mouse" );

			_ShowRadialLoadout();
			return;
		}

		_ShowSingleSlotLoadout();
	};

	var _ToggleTeam = function()
	{
		var elTeams = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSelectTeam' ).Children();

		for ( var i = 0; i < elTeams.length; i++ )
		{
			                                         

			if ( !elTeams[ i ].checked )
			{
				elTeams[ i ].checked = true;
				break;
			}
		}

		_ShowItemsForSelectedSlot();
	};

	var _OnReadyForDisplay = function()
	{
		                       
		                              
		$.DispatchEvent( "ShowLoadout", _GetSelectededLoadoutSlot(), Number( _GetSelectededTeam() ) );
		Loadout.PlayerEquipSlotChangedHandler = $.RegisterForUnhandledEvent( 'PanoramaComponent_Inventory_PlayerEquipSlotChanged', Loadout.UpdateForSingleSlotItems );
	};

	var _OnUnreadyForDisplay = function()
	{
		if ( Loadout.PlayerEquipSlotChangedHandler )
		{
			$.UnregisterForUnhandledEvent( 'PanoramaComponent_Inventory_PlayerEquipSlotChanged', Loadout.PlayerEquipSlotChangedHandler );
			Loadout.PlayerEquipSlotChangedHandler = undefined;
		}
	};

	var _UpdateForSingleSlotItems = function()
	{
		if ( _GetUsesWedges() )
		{
			return;
		}

		_UpdateSingleItem();
		_UpdateItemList();
	};
	
	var _SetLoadoutToSlot = function( itemSlot, subslot, numTeam )
	{
		if ( itemSlot === 'spray' || itemSlot === 'clothing' )
		{
			itemSlot = subslot;
		}
		
		var elSlots = $.GetContextPanel().FindChildInLayoutFile( 'LoadoutSlotSelectionRadios' );
		var elSelectedSlot = elSlots.Children().filter( slot => slot.GetAttributeString( 'data-slot', '' ) === itemSlot );
		elSelectedSlot[ 0 ].checked = true;

		if ( _GetUsesWedges() )
		{
			$.DispatchEvent( "ShowLoadout", subslot, numTeam );
			var elWedges = $.GetContextPanel().FindChildInLayoutFile( 'ItemWheel' );
			var wedgeList = elWedges.Children().filter( wedge => wedge.GetAttributeString( 'equip_slot', '' ) === subslot );
			wedgeList[ 0 ].checked = true;

			_ShowRadialLoadout();
		}
		else
		{
			_ShowSingleSlotLoadout();
		}	
		
		                              
		
		
		                                                                                          
		                                                                                                                      
		  
	}	


                          
    return {
		Init: _Init,
		ShowRadialLoadout: _ShowRadialLoadout,
		ShowSingleSlotLoadout: _ShowSingleSlotLoadout,
		ShowItemsForSelectedSlot: _ShowItemsForSelectedSlot,
		OnReadyForDisplay: _OnReadyForDisplay,
		OnUnreadyForDisplay: _OnUnreadyForDisplay,
		UpdateForSingleSlotItems: _UpdateForSingleSlotItems,
		ResetFlair: _ResetFlair,
		UpdateItemLister: _UpdateItemList,
		SetLoadoutToSlot: _SetLoadoutToSlot,
		ToggleTeam: _ToggleTeam
    };

} )();

                                                                                                    
                                           
                                                                                                    
(function ()
{
	Loadout.Init();
	$.RegisterEventHandler( 'ReadyForDisplay', $.GetContextPanel(), Loadout.OnReadyForDisplay );
	$.RegisterEventHandler( 'UnreadyForDisplay', $.GetContextPanel(), Loadout.OnUnreadyForDisplay );
	$.RegisterForUnhandledEvent( 'ShowLoadoutForItem', Loadout.SetLoadoutToSlot );
})();
