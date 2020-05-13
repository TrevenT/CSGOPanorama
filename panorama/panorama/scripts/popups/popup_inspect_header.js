'use strict';

var InspectHeader = ( function()
{
	var _Init = function( elPanel, itemId, funcGetSettingCallback)
	{
		if ( funcGetSettingCallback( 'inspectonly', 'false' ) === 'false' )
			return;
		
		elPanel.RemoveClass( 'hidden' );
		
		_SetName( elPanel, itemId );
		_SetRarity( elPanel, itemId );
		_SetCollectionInfo( elPanel, itemId );
	};
	
	var _SetName = function( elPanel, ItemId )
	{
		elPanel.FindChildInLayoutFile( 'InspectName' ).text = ItemInfo.GetName( ItemId );
	};
	
	var _SetRarity = function( elPanel, itemId )
	{
		var rarityColor = ItemInfo.GetRarityColor( itemId );
		elPanel.FindChildInLayoutFile( 'InspectBar' ).style.washColor = rarityColor;
	};
	
	var _SetCollectionInfo = function( elPanel, itemId )
	{
		var setName = ItemInfo.GetSet( itemId );
		var elImage = elPanel.FindChildInLayoutFile( 'InspectSetImage' );
		var elLabel = elPanel.FindChildInLayoutFile( 'InspectCollection' );
		
		if ( setName === '' )
		{
			elImage.visible = false;
			elLabel.visible = false;
			return;
		}

		elLabel.text = $.Localize( '#CSGO_' + ItemInfo.GetSet( itemId ) );
		elLabel.visible = true;

		elImage.SetImage( 'file://{images_econ}/econ/set_icons/' + setName + '_small.png' );
		elImage.visible = true;
	};

	return {
		Init : _Init
	}
} )();

