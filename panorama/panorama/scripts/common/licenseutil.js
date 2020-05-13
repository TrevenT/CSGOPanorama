                                                             

"use strict";

var LicenseUtil = ( function ()
{
	var _GetCurrentLicenseRestrictions = function()
	{
		var szButtonText = "#Store_Get_License";
		var szMessageText = "#SFUI_LoginLicenseAssist_NoOnlineLicense";
		switch ( MyPersonaAPI.GetLicenseType() )
		{
		case "free_pw_needlink":
			szButtonText = "#Store_Link_Accounts";
			szMessageText = "#SFUI_LoginLicenseAssist_PW_NeedToLinkAccounts";
			break;
		case "free_pw_needupgrade":
			szMessageText = "#SFUI_LoginLicenseAssist_HasLicense_PW";
			break;
		case "free_pw":
			szMessageText = "#SFUI_LoginLicenseAssist_NoOnlineLicense_PW";
			break;
		case "purchased":
			return false;
		}

		return {
			license_msg : szMessageText,
			license_act : szButtonText
		};
	}

	var _ShowLicenseRestrictions = function( restrictions )
	{
		if ( restrictions !== false )
		{
			                              
			return UiToolkitAPI.ShowGenericPopupYesNo(
				$.Localize( restrictions.license_act ),
				$.Localize( restrictions.license_msg ),
				'',
				function() { MyPersonaAPI.ActionBuyLicense(); },
				function() {}
			);
		}
	}

	return{
		GetCurrentLicenseRestrictions : _GetCurrentLicenseRestrictions,
		ShowLicenseRestrictions : _ShowLicenseRestrictions
	};
})();