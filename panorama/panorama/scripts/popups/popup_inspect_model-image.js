'use strict';

var InspectModelImage = ( function (){

	var m_charAnimIsPlaying = false;
	var m_bCanShowCertificateInfo = true;
	var m_bCanShowEquipControls = true;
	var m_elPanel = null;

	var _Init = function ( elPanel, itemId, funcGetSettingCallback)
	{
		if ( !InventoryAPI.IsValidItemID( itemId ) )
		{
			return;
		}

		var model = ItemInfo.GetModelPathFromJSONOrAPI( itemId );
		m_elPanel = elPanel;

		if ( model )
		{
			_SetModelScene( elPanel, model );
		}
		else
		{
			_SetImage( elPanel, itemId );
		}
	};

	var _SetModelScene = function ( elParent, model )
	{
		                                              

		var elPanel = elParent.FindChildInLayoutFile( 'InspectItemModel' );
		elPanel.SetScene( "resource/ui/econ/ItemModelPanelCharWeaponInspect.res",
			model,
			false
		);

		elPanel.RemoveClass( 'hidden' );
	};

	var _SetImage = function( elParent, itemId )
	{
		var elPanel = elParent.FindChildInLayoutFile( 'InspectItemImage' );
		elPanel.itemid = itemId;

		elPanel.RemoveClass( 'hidden' );
		_TintSprayImage( itemId, elPanel );
	};

	var _TintSprayImage = function( id, elImage )
	{
		TintSprayIcon.CheckIsSprayAndTint( id, elImage );
	};

	var _SetCharScene = function ( elParent, id, selectedModel, selectedTeam )
	{
		var elPanel = elParent.FindChildInLayoutFile( 'InspectModelChar' );

		var settings = {
			panel: elPanel,
			team: selectedTeam,
			model: selectedModel,
			itemId: id,
			loadoutSlot: ItemInfo.GetSlotSubPosition( id ),
			playIntroAnim: false,
			selectedWeapon: ItemInfo.GetItemDefinitionName ( id )
		};
	
		CharacterAnims.PlayAnimsOnPanel( settings );
		CharacterAnims.StoreModelPanelSettingsForSaving( settings );
	};

	var _CancelCharAnim = function( elParent )
	{
		CharacterAnims.CancelScheduledAnim( elParent.FindChildInLayoutFile( 'InspectModelChar' ) );
	};

	var _ShowHideItemPanel = function( elParent, bshow )
	{
		if ( !elParent.IsValid() )
			return;
		
		elParent.FindChildTraverse( 'InspectModelContainer' ).SetHasClass( 'hidden', !bshow );
		
		if ( bshow )
			$.DispatchEvent( "PlaySoundEffect", "weapon_showSolo", "MOUSE" );
	};

	var _ShowHideCharPanel = function( elParent, bshow )
	{
		if ( !elParent.IsValid() )
			return;
		
		elParent.FindChildTraverse( 'InspectModelCharContainer' ).SetHasClass( 'hidden', !bshow );

		if ( bshow )
			$.DispatchEvent( "PlaySoundEffect", "weapon_showOnChar", "MOUSE" );
	};

	var _GetModelPanel = function()
	{
		return m_elPanel.FindChildInLayoutFile( 'InspectItemModel' );
	};

	var _GetImagePanel = function()
	{
		return m_elPanel.FindChildInLayoutFile( 'InspectItemImage' );
	};

	return{
		Init: _Init,
		SetCharScene: _SetCharScene,
		CancelCharAnim: _CancelCharAnim,
		ShowHideItemPanel: _ShowHideItemPanel,
		ShowHideCharPanel: _ShowHideCharPanel,
		GetModelPanel: _GetModelPanel,
		GetImagePanel: _GetImagePanel
	};
} )();

( function()
{
} )();
