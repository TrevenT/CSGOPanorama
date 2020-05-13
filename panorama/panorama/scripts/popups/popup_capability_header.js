'use strict';

var CapabiityHeader = ( function()
{
	var m_bShowWarning = true;                                            
	var m_worktype = '';                                                                             
	var m_storeItemid = '';
	var m_ToolId = '';
	
	var _Init = function( elPanel, itemId, funcGetSettingCallback )
	{
		m_worktype = funcGetSettingCallback( "asyncworktype", "" );
		m_storeItemid = funcGetSettingCallback( "storeitemid", "" );
		m_ToolId = funcGetSettingCallback( "toolid", "" );

		if ( !m_worktype && !m_storeItemid )
			return;
		
		m_bShowWarning = ( funcGetSettingCallback( "asyncworkitemwarning", "yes" ) === 'no' ) ? false : true;

		elPanel.RemoveClass( 'hidden' );
		_SetDialogVariables( elPanel, itemId );
		_SetUpHeaders( elPanel );
	};
	
	var _SetDialogVariables = function( elPanel, itemId )
	{
		elPanel.SetDialogVariable( "itemname", ItemInfo.GetName( itemId ) );
	};
	
	var _SetUpHeaders = function( elPanel )
	{
		_SetUpTitle( elPanel );
		_SetUpWarning( elPanel );
		_SetUpDesc( elPanel );
	};

	var _SetUpTitle = function( elPanel )
	{
		var elTitle = elPanel.FindChildInLayoutFile( 'CapabilityTitle' );
		m_worktype = m_storeItemid ? 'purchase' : m_worktype;
		
		                                                       
		if( !m_ToolId && m_worktype === 'decodeable' )
		{
			elTitle.text = $.Localize( 'popup_totool_'+m_worktype+'_header', elPanel );
		}
		else
		{
			elTitle.text = $.Localize( '#popup_'+m_worktype+'_title', elPanel );
		}
	};

	var _SetUpWarning = function( elPanel )
	{
		var elWarn = elPanel.FindChildInLayoutFile( 'CapabilityWarning' );

		if ( m_bShowWarning )
		{
			elWarn.RemoveClass( 'hidden' );
			elWarn.FindChildInLayoutFile( 'CapabilityWarningLabel' ).text = '#popup_'+m_worktype+'_warning';
		}
		else
		{
			elWarn.AddClass( 'hidden' );
		}
	};

	var _SetUpDesc = function ( elPanel)
	{
		elPanel.FindChildInLayoutFile( 'CapabilityDesc' ).text = $.Localize( '#popup_'+m_worktype+'_desc', elPanel );
	};

	return {
		Init : _Init
	};
} )();