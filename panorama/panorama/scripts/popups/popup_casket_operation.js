"use strict";

var m_CasketOperationTimeoutScheduledHandle = null;
var m_strShowSelectItemForCapabilityPopupCapability = '';

var SetupPopup = function()
{
	var strOperation = $.GetContextPanel().GetAttributeString( "op", "" );
	$.GetContextPanel().SetDialogVariable( "title", $.Localize( "#popup_casket_title_" + strOperation ) );

	m_strShowSelectItemForCapabilityPopupCapability = $.GetContextPanel().GetAttributeString( "nextcapability", "" );

	                 
	var elItem = $( "#CasketItemPanel" );
	var itemid = $.GetContextPanel().GetAttributeString( "subject_item_id", "" );
	elItem.SetAttributeString( 'itemid', itemid );
	elItem.BLoadLayoutSnippet( "LootListItem" );

	                                 
	elItem.FindChildInLayoutFile( 'ItemImage' ).itemid = itemid;
	elItem.FindChildInLayoutFile( 'JsRarity' ).style.backgroundColor = ItemInfo.GetRarityColor( itemid );
	ItemInfo.GetFormattedName( itemid ).SetOnLabel( elItem.FindChildInLayoutFile( 'JsItemName' ) );

                             
    var spinnerVisible = $.GetContextPanel().GetAttributeInt( "spinner", 0 );
    $( "#Spinner" ).SetHasClass( "SpinnerVisible", spinnerVisible );
    
	m_CasketOperationTimeoutScheduledHandle = $.Schedule( 10, PanelTimedOut );
	var schOperation = 0.75;
	if ( strOperation === 'loadcontents' ) {
		schOperation = 0.5;
	} else if ( ( strOperation === 'add' ) && m_strShowSelectItemForCapabilityPopupCapability ) {
		schOperation = 0.25;
	}
	          
	                                                                           
	              	                                                          
	 
		                                
		                  
			                       
	 
	          
    $.Schedule( schOperation, LaunchOperation );

	                                                                                                     
	$.RegisterForUnhandledEvent( 'PanoramaComponent_Inventory_ItemCustomizationNotification', OnItemCustomizationNotification );
};

var PanelTimedOut = function()
{
                                                     
    m_CasketOperationTimeoutScheduledHandle = null;
    $.DispatchEvent( 'UIPopupButtonClicked', '' );

    UiToolkitAPI.ShowGenericPopupOk(
        $.Localize( '#SFUI_SteamConnectionErrorTitle' ),
        $.Localize( '#SFUI_Steam_Error_LinkUnexpected' ),
        '',
        function()
        {
        },
        function()
        {
        }
    );
};

var _CancelCasketOperationTimeoutScheduledHandle  = function()
{
    if ( m_CasketOperationTimeoutScheduledHandle )
    {
        $.CancelScheduled( m_CasketOperationTimeoutScheduledHandle );
        m_CasketOperationTimeoutScheduledHandle = null;
    }
};

var _ClosePopUp = function()
{
    $.DispatchEvent( 'UIPopupButtonClicked', '' );
};

var _TeardownPreviousInventoryCapabilitiesPopup = function()
{
	$.DispatchEvent( 'ContextMenuEvent', '' );
	$.DispatchEvent( 'HideSelectItemForCapabilityPopup' );
	$.DispatchEvent( 'UIPopupButtonClicked', '' );
	$.DispatchEvent( 'CapabilityPopupIsOpen', false );
};

function OnItemCustomizationNotification ( numericType, type, itemid )
{
	_CancelCasketOperationTimeoutScheduledHandle();
	_ClosePopUp();

	switch ( type )
	{
	case 'casket_too_full':
	case 'casket_inv_full':
		UiToolkitAPI.ShowGenericPopupOk(
			$.Localize( '#popup_casket_title_error_' + type ),
			$.Localize( '#popup_casket_message_error_' + type ),
			'',
			function()
			{
			},
			function()
			{
			}
		);
		break;
	case 'casket_added':
		                        
		if ( m_strShowSelectItemForCapabilityPopupCapability ) {                                    
			_TeardownPreviousInventoryCapabilitiesPopup();
			$.DispatchEvent( "ShowSelectItemForCapabilityPopup", m_strShowSelectItemForCapabilityPopupCapability, itemid, '' );
		}
		else  {                                                                          
			$.DispatchEvent( 'PanoramaComponent_MyPersona_InventoryUpdated' );
		}
		break;
	case 'casket_removed':
		                                                                                       
		_TeardownPreviousInventoryCapabilitiesPopup();
		if ( InventoryAPI.GetItemAttributeValue( itemid, 'items count' ) ) {
			$.DispatchEvent( "ShowSelectItemForCapabilityPopup", m_strShowSelectItemForCapabilityPopupCapability, itemid, '' );
		}
		break;
	case 'casket_contents':
		                              
		$.DispatchEvent( "ShowSelectItemForCapabilityPopup", m_strShowSelectItemForCapabilityPopupCapability, itemid, '' );
		break;
	default:
		             
		                                                                                                 
		break;
	}
};

                                 
    
   	                                               
   	              
     

function LaunchOperation()
{
	var strOperation = $.GetContextPanel().GetAttributeString( "op", "" );
	var strCasketItemID = $.GetContextPanel().GetAttributeString( "casket_item_id", "" );
	var strSubjectItemID = $.GetContextPanel().GetAttributeString( "subject_item_id", "" );
	                                                                                                                   

	var nOpRequestNumber = 0;
	switch ( strOperation )
	{
		case "add": nOpRequestNumber = 1; break;
		case "remove": nOpRequestNumber = -1; break;
	}
	InventoryAPI.PerformItemCasketTransaction( nOpRequestNumber, strCasketItemID, strSubjectItemID );
}

