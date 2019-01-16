/**
 *
 */
package ai.bell.shop.web.ctl;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author john
 *
 */
@Controller
public class IndexCtl {

	@RequestMapping(path = {"index", "index.html", ""})
	public String index() {
		return "index";
	}

}
